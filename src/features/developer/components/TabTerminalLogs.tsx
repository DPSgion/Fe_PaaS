import { useState, useEffect, useRef } from 'react';
import axios from '../../../lib/axios';

const MAX_LOG_LINES = 500; // Giới hạn cứng 500 dòng để chống tràn RAM và giật lag DOM

export const TabTerminalLogs = ({ projectId }: { projectId: string }) => {
    const [logs, setLogs] = useState<string[]>([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isStopped, setIsStopped] = useState(false);
    
    // SỬA GẮT 1: Bỏ logEndRef, thay bằng containerRef trỏ thẳng vào thẻ bọc ngoài cùng
    const containerRef = useRef<HTMLDivElement>(null);
    const eventSourceRef = useRef<EventSource | null>(null);
    const isAutoScrollRef = useRef(true);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            isAutoScrollRef.current = true;
        } else {
            isAutoScrollRef.current = false;
        }
    };

    // SỬA GẮT 2: Can thiệp thẳng vào tọa độ cuộn (scrollTop), không dùng scrollIntoView
    useEffect(() => {
        if (isAutoScrollRef.current && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        if (!projectId) return;

        setLogs([]); 
        setIsConnecting(true);
        setIsStopped(false);
        isAutoScrollRef.current = true; 

        const baseURL = axios.defaults.baseURL || 'http://localhost:8080';
        const sseUrl = `${baseURL}/deployments/project/${projectId}/logs/terminal`;

        const sse = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = sse;

        sse.addEventListener('log', (event) => {
            setIsConnecting(false);
            setLogs(prev => {
                const newLogs = [...prev, event.data];
                return newLogs.length > MAX_LOG_LINES ? newLogs.slice(newLogs.length - MAX_LOG_LINES) : newLogs;
            });
        });

        sse.addEventListener('EOF', () => {
            sse.close();
            setIsStopped(true);
            setLogs(prev => [...prev, "\n[SYSTEM] Luồng Terminal đã kết thúc. Container đã bị dừng."]);
        });

        sse.onerror = (err) => {
            console.error("Lỗi SSE Terminal:", err);
            sse.close();
            setIsConnecting(false);
            setIsStopped(true);
            setLogs(prev => {
                const newLogs = [...prev, "\n[SYSTEM] Mất kết nối đến luồng log hoặc dự án chưa có Container nào hoạt động."];
                return newLogs.length > MAX_LOG_LINES ? newLogs.slice(newLogs.length - MAX_LOG_LINES) : newLogs;
            });
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log("Terminal Log Đã ngắt kết nối")
            }
        };
    }, [projectId]);

    return (
        <div className="animate-in fade-in duration-300 p-4">
            {/* SỬA GẮT 3: Gắn ref={containerRef} vào thẻ div chứa thanh cuộn */}
            <div 
                ref={containerRef}
                className="bg-gray-950 rounded-lg shadow-inner p-4 h-[400px] overflow-y-auto font-mono text-[13px] leading-relaxed tracking-wide"
                onScroll={handleScroll}
            >
                
                {isConnecting && (
                    <div className="text-gray-500 mb-4 animate-pulse">Đang kết nối đến container logging stream...</div>
                )}

                <div className="text-gray-300 whitespace-pre-wrap break-all">
                    {logs.map((log, idx) => {
                        let colorClass = "text-gray-300";
                        if (log.startsWith("[ERROR]")) colorClass = "text-red-400 font-bold";
                        if (log.includes("[WARN]")) colorClass = "text-yellow-400";
                        if (log.includes("[INFO]")) colorClass = "text-green-400";

                        return <div key={idx} className={colorClass}>{log}</div>;
                    })}
                    
                    {!isStopped && !isConnecting && (
                        <div className="mt-2 text-gray-300 flex items-center">
                            <span className="text-blue-400 mr-2">root@paas:/app#</span> 
                            <span className="w-2 h-4 bg-gray-300 animate-pulse"></span>
                        </div>
                    )}
                    
                    {/* Đã xóa điểm neo <div ref={logEndRef} className="h-4" /> ở đây để loại bỏ tận gốc nguyên nhân */}
                </div>
            </div>
        </div>
    );
};