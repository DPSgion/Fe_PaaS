// src/components/ui/NotificationDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiServer, FiCheck } from 'react-icons/fi';

// ============================================================================
// MOCK DATA & TYPES
// ============================================================================
type NotifType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: NotifType;
    isRead: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: 'n1',
        title: 'Container Crashed',
        message: 'Project Test-App-01 stopped unexpectedly due to OOM (Out of Memory).',
        time: '2 mins ago',
        type: 'error',
        isRead: false,
    },
    {
        id: 'n2',
        title: 'Deploy Successful',
        message: 'Cupzone Backend has been successfully deployed (commit: a1b2c3d4).',
        time: '1 hour ago',
        type: 'success',
        isRead: false,
    },
    {
        id: 'n3',
        title: 'High CPU Warning',
        message: 'AI English Master is consuming 85% CPU. Consider scaling up.',
        time: '3 hours ago',
        type: 'warning',
        isRead: true,
    },
    {
        id: 'n4',
        title: 'System Maintenance',
        message: 'PaaS System will undergo scheduled maintenance at 02:00 AM UTC.',
        time: '1 day ago',
        type: 'info',
        isRead: true,
    },
    {
        id: 'n5',
        title: 'Role Updated',
        message: 'Your role has been updated to SYSTEM_ADMIN by superuser.',
        time: '2 days ago',
        type: 'info',
        isRead: true,
    },
];

// ============================================================================
// COMPONENT
// ============================================================================
export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // TODO 1: Gắn WebSocket/SSE hứng thông báo realtime từ Backend
    // useEffect(() => {
    //   const socket = new WebSocket('ws://api.paas.com/notifications');
    //   socket.onmessage = (event) => {
    //     const newNotif = JSON.parse(event.data);
    //     setNotifications(prev => [newNotif, ...prev]);
    //   };
    //   return () => socket.close();
    // }, []);

    // TODO 2: Gắn API fetch danh sách thông báo lịch sử (Pagination) lúc khởi tạo
    // useEffect(() => { fetch('/api/notifications')... }, []);

    // Đếm số lượng chưa đọc
    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Logic click ra ngoài (Click outside) để đóng dropdown
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
    // TODO 3: Gọi API để đồng bộ trạng thái "Đã đọc" xuống Database
    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // Icon động theo loại thông báo
    const getIcon = (type: NotifType) => {
        switch (type) {
            case 'success': return <FiCheckCircle className="text-green-500 mt-0.5 shrink-0" size={16} />;
            case 'error': return <FiAlertCircle className="text-red-500 mt-0.5 shrink-0" size={16} />;
            case 'warning': return <FiServer className="text-orange-500 mt-0.5 shrink-0" size={16} />;
            case 'info': return <FiInfo className="text-blue-500 mt-0.5 shrink-0" size={16} />;
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
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{notif.time}</span>
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