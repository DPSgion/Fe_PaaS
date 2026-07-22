import { useState, useEffect, useRef } from 'react';
import { FiX, FiActivity, FiTerminal } from 'react-icons/fi';
import { projectApi } from '../api/projectApi';
import axios from '../../../lib/axios';

interface DeployLogViewerProps {
    isOpen: boolean;
    onClose: () => void;
    deploymentId: number | null;
    status: string; // 'BUILDING', 'SUCCESS', 'FAILED', 'STOPPED', v.v.
    onDeployFinished?: () => void; // Gọi khi nhận được cờ EOF
}

export const DeployLogViewer = ({ isOpen, onClose, deploymentId, status, onDeployFinished }: DeployLogViewerProps) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);

    // Tham chiếu để kéo thanh cuộn xuống đáy
    const logEndRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);

    // Auto-scroll: Luôn bám theo dòng log mới nhất
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (!isOpen || !deploymentId) return;

        setLogs([]); // Reset màn hình khi mở lại

        if (status === 'BUILDING') {
            // ----------------------------------------------------
            // KỊCH BẢN 1: ĐANG BUILD -> MỞ ỐNG SSE NGHE LÉN
            // ----------------------------------------------------
            setIsStreaming(true);
            // Lấy baseURL từ file cấu hình của bạn, dự phòng localhost:8080 nếu lỗi
            const baseUrl = axios.defaults.baseURL || 'http://localhost:8080';

            // Nối thẳng với endpoint backend (nhớ check lại xem BE của bạn có prefix /api không nhé)
            const sseUrl = `${baseUrl}/deployments/${deploymentId}/logs/live`;

            const sse = new EventSource(sseUrl, { withCredentials: true });
            eventSourceRef.current = sse;

            // Hứng dòng log
            sse.addEventListener('log', (event) => {
                setLogs(prev => [...prev, event.data]);
            });

            // Hứng nhịp tim (Ping) -> Bỏ qua không in ra màn hình
            sse.addEventListener('ping', () => {
                console.log("Received keep-alive ping from server.");
            });

            // Hứng cờ ngắt kết nối (EOF)
            sse.addEventListener('EOF', () => {
                sse.close();
                setIsStreaming(false);
                setLogs(prev => [...prev, "\n[SYSTEM] Tiến trình triển khai đã hoàn tất."]);
                if (onDeployFinished) onDeployFinished();
            });

            sse.onerror = (err) => {
                sse.close();
                setIsStreaming(false);
                console.error("Lỗi SSE Live Log:", err);
            };

        } else {
            // ----------------------------------------------------
            // KỊCH BẢN 2: ĐÃ XONG -> ĐỌC FILE TĨNH 1 LẦN
            // ----------------------------------------------------
            setIsLoading(true);
            projectApi.getStaticDeployLog(deploymentId)
                .then(data => {
                    // Cắt chuỗi theo ký tự xuống dòng để render ra mảng
                    setLogs(data.split('\n'));
                })
                .catch(() => {
                    setLogs(["[ERROR] Không thể lấy dữ liệu log hoặc file log đã bị xóa."]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        // Hủy đăng ký (Rút ống dẫn) khi đóng Modal
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [isOpen, deploymentId, status]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-[#1e1e1e] w-full max-w-[95vw] lg:max-w-7xl rounded-xl shadow-2xl flex flex-col h-[85vh] border border-gray-700 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#252526] border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <h3 className="text-gray-200 font-semibold font-mono text-sm flex items-center gap-2">
                            <FiTerminal className="text-indigo-400" />
                            DEPLOYMENT LOG #{deploymentId}
                        </h3>
                        {isStreaming ? (
                            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded border border-green-400/20">
                                <FiActivity className="animate-pulse" /> Live Tracking
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">
                                Static View
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                {/* Terminal Window */}
                <div className="flex-1 overflow-y-auto p-8 font-mono text-[15px] leading-loose bg-[#1e1e1e] tracking-wide">
                    {isLoading ? (
                        <div className="text-gray-500 animate-pulse">Đang tải lịch sử log...</div>
                    ) : logs.length === 0 && !isStreaming ? (
                        <div className="text-gray-500 italic">Không có dữ liệu ghi nhận.</div>
                    ) : (
                        <div className="text-gray-300 whitespace-pre-wrap break-words"> {/* Thêm break-words ở đây để chống cuộn ngang */}
                            {logs.map((log, idx) => {
                                // Logic tô màu đơn giản cho Terminal
                                let colorClass = "text-gray-300";
                                if (log.includes("[ERROR]") || log.includes("FAILED")) colorClass = "text-red-400 font-semibold";
                                if (log.includes("[WARN]")) colorClass = "text-yellow-400";
                                if (log.includes("[INFO]") || log.includes("SUCCESS")) colorClass = "text-green-400";

                                return (
                                    <div key={idx} className={colorClass}>{log}</div>
                                );
                            })}
                            {/* Dấu neo để Auto-scroll */}
                            <div ref={logEndRef} className="h-4" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};