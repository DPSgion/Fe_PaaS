import { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiFilter, FiUser, FiBox } from 'react-icons/fi';
import { auditLogApi, type AuditLog } from './api/auditLogApi';
import toast from 'react-hot-toast';

const ACTION_TYPES = [
  'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'RESET_PASSWORD', 'CHANGE_PASSWORD', 
  'BAN_USER', 'UNBAN_USER', 'GRANT_ADMIN', 'REVOKE_ADMIN', 'SEND_MAIL',
  'CREATE_PROJECT', 'DELETE_PROJECT', 'FORCE_STOP', 
  'CREATE_ENV', 'UPDATE_ENV', 'DELETE_ENV'
];

export const AuditLogManagement = () => {
  // States chứa dữ liệu
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States lọc & tìm kiếm
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // States phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Xử lý Debounce cho ô search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Ép về trang 1 khi đổi từ khóa
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Xử lý Reset trang khi đổi các Filter khác
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Biến hình YYYY-MM-DD thành DD/MM/YYYY trước khi gửi
        const formattedFromDate = fromDate ? fromDate.split('-').reverse().join('/') : undefined;
        const formattedToDate = toDate ? toDate.split('-').reverse().join('/') : undefined;

        const data = await auditLogApi.getLogs(
          currentPage - 1,
          pageSize,
          debouncedSearch,
          actionFilter,
          formattedFromDate,
          formattedToDate
        );
        
        setLogs(data.content);
        setTotalPages(data.totalPages === 0 ? 1 : data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error: any) {
        // Hứng lỗi trực tiếp từ Backend để dễ debug
        const errorMessage = error.response?.data?.message || error.response?.data || "Không thể tải dữ liệu Audit Log lúc này.";
        console.error("Failed to fetch audit logs", error);
        toast.error(errorMessage);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [currentPage, debouncedSearch, actionFilter, fromDate, toDate]);

  // SỬA GẮT: Cập nhật hàm bôi màu cho khớp với các Enum mới
  const getActionBadgeClass = (action: string) => {
    const dangerActions = ['DELETE_USER', 'BAN_USER', 'REVOKE_ADMIN', 'DELETE_PROJECT', 'FORCE_STOP', 'DELETE_ENV'];
    const successActions = ['CREATE_USER', 'UNBAN_USER', 'GRANT_ADMIN', 'CREATE_PROJECT', 'CREATE_ENV'];
    
    if (dangerActions.includes(action)) return 'bg-red-50 text-red-700 border-red-200';
    if (successActions.includes(action)) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-blue-50 text-blue-700 border-blue-200'; // Các action còn lại (Update/Change)
  };

  const formatTimestamp = (timeStr: string) => {
    if (!timeStr) return '';
    const [datePart, timePart] = timeStr.split(' ');
    if (!datePart) return timeStr;
    
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year} ${timePart || ''}`.trim();
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header & Bộ lọc */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-1">Giám sát các thao tác quan trọng trên hệ thống</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Ô Tìm kiếm Actor */}
          <div className="relative flex-1 min-w-[300px] md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by actor..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          {/* Lọc theo Action Type */}
          <div className="relative">
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={actionFilter}
              onChange={(e) => handleFilterChange(setActionFilter, e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer bg-white font-medium text-gray-700"
            >
              <option value="ALL">All Actions</option>
              {ACTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Lọc Từ ngày - Đến ngày */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => handleFilterChange(setFromDate, e.target.value)}
                className="pl-3 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="relative">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => handleFilterChange(setToDate, e.target.value)}
                className="pl-3 pr-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bảng dữ liệu */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">TIMESTAMP</th>
                <th className="px-6 py-4">ACTOR</th>
                <th className="px-6 py-4">ACTION</th>
                <th className="px-6 py-4">TARGET</th>
                <th className="px-6 py-4 w-1/3">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                      <p>Loading logs...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy bản ghi Audit Log nào.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FiCalendar className="text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {log.actor}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-[11px] px-2.5 py-1 rounded-md border font-bold tracking-tight ${getActionBadgeClass(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    {/* Gắn Icon dựa trên loại Action để phân biệt rõ Target là User hay Project */}
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        {log.actionType.includes('PROJECT') || log.actionType.includes('ENV') || ['FORCE_STOP', 'SEND_MAIL'].includes(log.actionType) ? (
                            <div className="bg-indigo-50 p-1.5 rounded text-indigo-600"><FiBox size={14} /></div>
                        ) : (
                            <div className="bg-teal-50 p-1.5 rounded text-teal-600"><FiUser size={14} /></div>
                        )}
                        {log.target}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs leading-relaxed">
                      {log.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Phân trang */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm font-medium">
          <div className="text-gray-500">
            Hiển thị <span className="font-bold text-gray-700">{logs.length}</span> / {totalElements} logs
          </div>
          
          <div className="flex items-center gap-4 text-gray-600">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className={`transition-colors ${currentPage === 1 || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
            >
              &lt; Trước
            </button>
            
            <span className="bg-white border border-gray-300 px-3 py-1 rounded-md">
              Trang {currentPage} / {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className={`transition-colors ${currentPage === totalPages || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
            >
              Tiếp &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};