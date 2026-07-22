import { useState, useEffect, useRef } from 'react';
import { 
    FiBell, FiCheckCircle, FiAlertCircle, FiInfo, FiServer, 
    FiCheck, FiCheckSquare, FiSearch, FiFilter, FiX, FiChevronDown 
} from 'react-icons/fi';
import { notificationApi, type NotificationResponse } from './api/notificationApi';

// Cấu hình các Option kèm Icon cho bộ lọc
const TYPE_OPTIONS = [
    { value: 'ALL', label: 'Tất cả thể loại', icon: <FiFilter className="text-gray-500" size={16} /> },
    { value: 'SUCCESS', label: 'SUCCESS', icon: <FiCheckCircle className="text-green-500" size={16} /> },
    { value: 'ERROR', label: 'ERROR', icon: <FiAlertCircle className="text-red-500" size={16} /> },
    { value: 'WARNING', label: 'WARNING', icon: <FiServer className="text-orange-500" size={16} /> },
    { value: 'INFO', label: 'INFO', icon: <FiInfo className="text-blue-500" size={16} /> }
];

export const NotificationList = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // States bộ lọc
    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // State cho Custom Dropdown
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // States phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Click outside để đóng Custom Dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Xử lý Debounce cho ô search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1); 
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
        setter(value);
        setCurrentPage(1);
    };

    // Hàm Reset toàn bộ Filter
    const handleClearFilters = () => {
        setSearchInput('');
        setDebouncedSearch('');
        setTypeFilter('ALL');
        setFromDate('');
        setToDate('');
        setCurrentPage(1);
    };

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const data = await notificationApi.getHistory(
                currentPage - 1, 
                pageSize,
                debouncedSearch,
                typeFilter,
                fromDate,
                toDate
            );
            setNotifications(data.content);
            setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [currentPage, debouncedSearch, typeFilter, fromDate, toDate]);

    const handleMarkAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await notificationApi.markAsRead(id);
        } catch (error) {
            console.error("Failed to mark as read", error);
            fetchNotifications(); 
        }
    };

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await notificationApi.markAllAsRead();
        } catch (error) {
            console.error("Failed to mark all as read", error);
            fetchNotifications();
        }
    };

    const getIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'SUCCESS': return <FiCheckCircle className="text-green-500" size={18} />;
            case 'ERROR': return <FiAlertCircle className="text-red-500" size={18} />;
            case 'WARNING': return <FiServer className="text-orange-500" size={18} />;
            case 'INFO': 
            default: return <FiInfo className="text-blue-500" size={18} />;
        }
    };

    // Kiểm tra xem có đang dùng filter nào không để hiện nút Clear
    const hasActiveFilters = searchInput || typeFilter !== 'ALL' || fromDate || toDate;
    const currentSelectedType = TYPE_OPTIONS.find(opt => opt.value === typeFilter) || TYPE_OPTIONS[0];

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                            <FiBell size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                            <p className="text-sm text-gray-500 mt-1">Quản lý và tra cứu thông báo hệ thống</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                            Total: <strong className="text-indigo-600">{totalElements}</strong>
                        </span>
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer border border-indigo-200"
                        >
                            <FiCheckSquare size={16} /> Mark all as read
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="relative flex-1 min-w-[250px]">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm nội dung thông báo..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    {/* Custom Dropdown thay thế cho Select */}
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            className="flex items-center justify-between gap-2 w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors outline-none cursor-pointer"
                        >
                            <div className="flex items-center gap-2 font-medium text-gray-700">
                                {currentSelectedType.icon}
                                {currentSelectedType.label}
                            </div>
                            <FiChevronDown className={`text-gray-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isTypeDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                {TYPE_OPTIONS.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            handleFilterChange(setTypeFilter, option.value);
                                            setIsTypeDropdownOpen(false);
                                        }}
                                        className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors cursor-pointer
                                            ${typeFilter === option.value ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        {option.icon}
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="date" 
                            value={fromDate}
                            onChange={(e) => handleFilterChange(setFromDate, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600 cursor-pointer"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                            type="date" 
                            value={toDate}
                            onChange={(e) => handleFilterChange(setToDate, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600 cursor-pointer"
                        />
                    </div>

                    {/* Nút Clear Filters (Chỉ hiện khi có điều kiện lọc) */}
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer border border-red-200"
                            title="Xóa bộ lọc"
                        >
                            <FiX size={16} /> Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                            <p>Đang tải thông báo...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <FiBell size={40} className="text-gray-300 mb-3" />
                            <p className="font-medium">Không tìm thấy thông báo nào phù hợp.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map((notif) => (
                                <div 
                                    key={notif.id} 
                                    onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                                    className={`p-5 flex gap-4 transition-colors ${!notif.isRead ? 'bg-indigo-50/20 cursor-pointer hover:bg-indigo-50/50' : 'opacity-70 bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="mt-1">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-1">
                                            <h4 className={`text-base ${notif.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                                                {notif.title}
                                            </h4>
                                            <span className="text-xs text-gray-400 font-medium font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200 w-fit">
                                                {notif.createdAt}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed max-w-4xl">
                                            {notif.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center min-w-[70px] justify-end">
                                        {!notif.isRead && (
                                            <span className="text-xs flex items-center gap-1 text-indigo-600 font-semibold">
                                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div> Mới
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm font-medium">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1 || isLoading}
                        className={`transition-colors ${currentPage === 1 || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
                    >
                        &lt; Previous
                    </button>
                    
                    <span className="bg-white border border-gray-300 px-3 py-1 rounded-md text-gray-600 shadow-sm">
                        Page {currentPage} / {totalPages}
                    </span>
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || isLoading}
                        className={`transition-colors ${currentPage === totalPages || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>
        </div>
    );
};