import { useState, useEffect, useRef } from 'react';
import { FiActivity, FiRefreshCw } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { projectApi, type ResourceChartData } from '../api/projectApi';
import axios from '../../../lib/axios';

// Cấu hình giới hạn số lượng điểm hiển thị trên biểu đồ (VD: 30 điểm)
const MAX_DATA_POINTS = 30;

interface ResourceMetricsChartProps {
    projectId: string;
    onDataUpdate?: (cpu: string, ram: string) => void; // Thêm dòng này
}


export const ResourceMetricsChart = ({ projectId, onDataUpdate }: ResourceMetricsChartProps) => {
    const [data, setData] = useState<ResourceChartData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);

    // 1. Hàm lấy dữ liệu lịch sử ban đầu (REST API)
    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const chartData = await projectApi.getResourceChart(projectId);
            // Cắt giữ lại đúng MAX_DATA_POINTS mới nhất để khỏi tràn RAM
            setData(chartData.length > MAX_DATA_POINTS ? chartData.slice(-MAX_DATA_POINTS) : chartData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu biểu đồ", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Sửa lại đoạn useEffect cuối cùng trong file ResourceMetricsChart.tsx
    useEffect(() => {
        if (data && data.length > 0 && onDataUpdate) {
            const latestPoint = data[data.length - 1];
            
            const cpuVal = Number(latestPoint.cpu) || 0;
            const ramVal = Number(latestPoint.ram) || 0; 
            
            onDataUpdate(
                cpuVal.toFixed(2), 
                `${ramVal} MB` 
            );
        }
    // SỬA GẮT Ở ĐÂY: Xóa onDataUpdate, chỉ giữ lại [data]
    }, [data]);

    // 2. Setup luồng thời gian thực (SSE)
    useEffect(() => {
        if (!projectId) return;

        // Gọi lấy data lịch sử trước để biểu đồ không bị trắng khi vừa vào trang
        fetchInitialData();

        // Lấy Base URL từ biến môi trường của Vite, hoặc fallback về localhost:8080
        const baseURL = axios.defaults.baseURL || 'http://localhost:8080';

        // Nối thẳng vào endpoint thực tế của Spring Boot
        const sseUrl = `${baseURL}/monitoring/projects/${projectId}/metrics/chart/stream`;

        // withCredentials vẫn bắt buộc phải có để gửi Cookie
        const sse = new EventSource(sseUrl, { withCredentials: true });
        eventSourceRef.current = sse;

        // Lắng nghe luồng khởi tạo
        sse.addEventListener('INIT', (event) => {
            console.log("✅ SSE Connection Established:", event.data);
        });

        // Lắng nghe dữ liệu mới đẩy từ Spring Boot
        sse.addEventListener('NEW_CHART_DATA', (event) => {
            try {
                const newDataPoint: ResourceChartData = JSON.parse(event.data);

                // Cập nhật State: Thêm điểm mới vào cuối mảng, đồng thời cắt bớt điểm cũ nhất ở đầu mảng
                setData(prevData => {
                    const updatedData = [...prevData, newDataPoint];
                    return updatedData.length > MAX_DATA_POINTS
                        ? updatedData.slice(updatedData.length - MAX_DATA_POINTS)
                        : updatedData;
                });
            } catch (error) {
                console.error("❌ Lỗi Parse dữ liệu SSE:", error);
            }
        });

        sse.onerror = (err) => {
            console.error("⚠️ Mất kết nối SSE, luồng đang bị gián đoạn:", err);
            // EventSource tự động reconnect mặc định, nên bạn không cần viết logic setInterval ở đây
        };

        // Rút ống dẫn, giải phóng bộ nhớ khi người dùng chuyển sang trang khác
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                console.log("🛑 Đã ngắt kết nối SSE an toàn.");
            }
        };
    }, [projectId]);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in duration-300">
            {/* Header của biểu đồ */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <FiActivity className="text-indigo-600" />
                    Real-time Resource Usage (CPU & RAM)
                </h3>

                {/* Nút Refresh giờ đóng vai trò Sync lại toàn bộ dữ liệu lịch sử nếu mạng lỗi */}
                <button
                    onClick={fetchInitialData}
                    disabled={isLoading}
                    className="text-gray-500 hover:text-indigo-600 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Force sync data"
                >
                    <FiRefreshCw className={isLoading ? "animate-spin" : ""} size={16} />
                </button>
            </div>

            {/* Khu vực vẽ biểu đồ (Giữ nguyên thiết kế Recharts) */}
            <div className="h-72 w-full">
                {isLoading && data.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-mono text-sm">
                        Đang thiết lập kết nối thời gian thực...
                    </div>
                ) : data.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg">
                        Chưa có dữ liệu tài nguyên
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />

                            <XAxis
                                dataKey="time"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                                axisLine={{ stroke: '#e5e7eb' }}
                                minTickGap={30}
                            />

                            <YAxis
                                yAxisId="left"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickLine={false}
                                axisLine={false}
                            />

                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                                isAnimationActive={false} // Tắt animation của Tooltip để render mượt hơn khi có data mới liên tục
                            />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                            {/* Chỉnh isAnimationActive=false cho Line để đồ thị nhảy số dứt khoát, không bị trượt lag */}
                            <Line isAnimationActive={false} yAxisId="left" type="monotone" dataKey="cpu" name="CPU Usage (%)" stroke="#4f46e5" strokeWidth={2} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            <Line isAnimationActive={false} yAxisId="right" type="monotone" dataKey="ram" name="RAM Usage (MB)" stroke="#10b981" strokeWidth={2} dot={{ r: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};