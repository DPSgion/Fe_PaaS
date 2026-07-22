import { useState, useRef, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiServer, FiCheck } from 'react-icons/fi';
import { notificationApi, type NotificationResponse } from './api/notificationApi';
import axios from '../../lib/axios';

// ============================================================================
// COMPONENT
// ============================================================================
export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Thay đổi kiểu dữ liệu về NotificationResponse và mảng rỗng ban đầu
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Tính toán số lượng chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // 1. FETCH LỊCH SỬ THÔNG BÁO KHI LOAD TRANG
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await notificationApi.getHistory(0, 10);
                setNotifications(data.content);
            } catch (error) {
                console.error("Failed to fetch notification history", error);
            }
        };
        fetchHistory();
    }, []);

    // 2. KẾT NỐI SSE ĐỂ HỨNG THÔNG BÁO REALTIME TỪ SPRING BOOT
    useEffect(() => {
    const baseUrl = axios.defaults.baseURL || 'http://localhost:8080';
    const sseUrl = `${baseUrl}/notifications/stream`;

    // withCredentials: true để trình duyệt tự động gửi cookie HttpOnly (phuong_paas)
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = () => console.log("🟢 SSE Connected Successfully!");
    eventSource.onerror = (e) => console.error("🔴 SSE Error:", e);

    eventSource.addEventListener('NEW_NOTIFICATION', (event) => {
        try {
            const newNotif = JSON.parse(event.data);
            setNotifications(prev => [newNotif, ...prev]);
        } catch (err) {
            console.error("Lỗi parse JSON:", err);
        }
    });

    return () => eventSource.close();
}, []);


    // Logic click ra ngoài để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý "Đánh dấu tất cả đã đọc"
    const handleMarkAllAsRead = async () => {
        // Tối ưu UX: Giao diện chuyển thành đã đọc ngay lập tức (Optimistic UI)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        try {
            // TODO: Gọi API Backend lưu xuống DB (Hiện tại API của bạn chưa có endpoint này)
            // await notificationApi.markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    // Đổi logic nhận kiểu Type In hoa của Spring Boot
    const getIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'SUCCESS': return <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" size={16} />;
            case 'ERROR': return <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />;
            case 'WARNING': return <FiServer className="text-orange-500 mt-0.5 shrink-0" size={16} />;
            case 'INFO':
            default: return <FiInfo className="text-blue-500 mt-0.5 shrink-0" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 1. Nút Icon Chuông (Trigger) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100 cursor-pointer outline-none"
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>

            {/* 2. Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">

                    {/* Header của Dropdown */}
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <FiCheck size={14} /> Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Danh sách thông báo (Giới hạn chiều cao & Cuộn) */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`px-4 py-3 border-b border-gray-50 flex items-start gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${notif.isRead ? 'opacity-70' : 'bg-indigo-50/30'}`}
                                >
                                    {getIcon(notif.type)}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className={`text-sm ${notif.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                {notif.title}
                                            </h4>
                                            {/* Ánh xạ sang trường createdAt của Backend */}
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{notif.createdAt}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                                            {notif.message}
                                        </p>
                                    </div>
                                    {/* Chấm xanh báo chưa đọc */}
                                    {!notif.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0"></div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-sm text-gray-500">
                                You're all caught up!
                            </div>
                        )}
                    </div>

                    {/* Footer dẫn sang trang xem tất cả */}
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-center">
                        <button className="text-xs font-semibold text-gray-600 hover:text-indigo-600 w-full py-1.5 transition-colors cursor-pointer">
                            View all notifications
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};