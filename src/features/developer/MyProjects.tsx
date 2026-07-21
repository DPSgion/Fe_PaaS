import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiLoader, FiMoreVertical, FiBox, FiSearch } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { projectApi, type ProjectListResponse } from './api/projectApi';

export const MyProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ==========================================================================
    // FILTER & SEARCH STATES (ĐÃ GẮN SESSION STORAGE)
    // ==========================================================================
    // Khởi tạo state bằng cách đọc từ bộ nhớ tạm (nếu có), không có thì lấy mặc định
    const [searchInput, setSearchInput] = useState(() => sessionStorage.getItem('my_projects_search') || '');
    const [debouncedSearch, setDebouncedSearch] = useState(() => sessionStorage.getItem('my_projects_search') || '');
    const [statusFilter, setStatusFilter] = useState(() => sessionStorage.getItem('my_projects_status') || 'ALL');

    // Lắng nghe sự thay đổi và tự động ghi đè xuống bộ nhớ tạm
    useEffect(() => {
        sessionStorage.setItem('my_projects_search', debouncedSearch);
        sessionStorage.setItem('my_projects_status', statusFilter);
    }, [debouncedSearch, statusFilter]);

    // Debounce Logic cho Search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchInput]);

    // ==========================================================================
    // API CALLS
    // ==========================================================================
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                // Truyền tham số search và filter xuống API
                const data = await projectApi.getMyProjects(debouncedSearch, statusFilter);
                setProjects(data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách dự án:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [debouncedSearch, statusFilter]); // Tự động gọi lại khi bộ lọc thay đổi

    // ==========================================================================
    // GOM NHÓM DỮ LIỆU
    // ==========================================================================
    const groupedProjects = useMemo(() => {
        return projects.reduce((acc, curr) => {
            const groupName = curr.projectName; 
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(curr);
            return acc;
        }, {} as Record<string, ProjectListResponse[]>);
    }, [projects]);

    const formatStatus = (backendStatus: string) => {
        switch (backendStatus) {
            case 'CRASHED': return 'Failed';
            case 'BUILDING': return 'Building';
            case 'RUNNING': return 'Running';
            default: return 'Stopped';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Kiểm tra xem User đang dùng bộ lọc hay không
    const isFiltering = debouncedSearch !== '' || statusFilter !== 'ALL';

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* 1. Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Good Morning, Phuong 👋
                    </h1>
                    <p className="text-gray-500 mt-1">These are your projects</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => navigate('/projects/new')}
                    className="cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                    <FiPlus className="mr-1" /> Create New Project
                </Button>
            </div>

            {/* 2. Toolbar: Search & Filter */}
            {/* Chỉ hiện Toolbar nếu đã từng có dự án, hoặc đang trong chế độ lọc */}
            {(projects.length > 0 || isFiltering) && (
                <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by project name..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                    </div>
                    
                    {/* Filter & Clear Action */}
                    <div className="flex gap-2 w-full sm:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 sm:w-auto border border-gray-300 rounded-lg py-2 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer transition-all min-w-[180px] font-medium"
                        >
                            <option value="ALL">All Status</option>
                            <option value="RUNNING" className="text-green-600 font-bold">Running</option>
                            <option value="STOPPED" className="text-gray-500 font-bold">Stopped</option>
                            <option value="BUILDING" className="text-blue-600 font-bold">Building</option>
                            <option value="CRASHED" className="text-red-600 font-bold">Failed</option>
                        </select>

                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSearchInput('');
                                setDebouncedSearch('');
                                setStatusFilter('ALL');
                                sessionStorage.removeItem('my_projects_search');
                                sessionStorage.removeItem('my_projects_status');
                            }}
                            className="px-4 font-semibold border-gray-300 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
                        >
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* 3. Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <FiLoader className="animate-spin" size={32} />
                    <p className="text-sm font-medium">Đang tải danh sách dự án...</p>
                </div>
            ) : projects.length > 0 ? (
                // KHU VỰC RENDER DỰ ÁN
                <div className="space-y-12">
                    {Object.entries(groupedProjects).map(([projectName, envs]) => (
                        <div key={projectName} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                {/* SỬA GẮT: Đã xóa nút [ Cài đặt dự án ] ở đây */}
                                <h2 className="text-xl font-bold text-gray-900 capitalize">{projectName}</h2>
                            </div>

                            <div className="flex overflow-x-auto snap-x gap-6 pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                                {envs.map((env) => (
                                    <div 
                                        key={env.id}
                                        onClick={() => navigate(`/project/${env.id}/env/default`)}
                                        className="min-w-[320px] max-w-[320px] shrink-0 snap-start bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                                    >
                                        <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiMoreVertical size={18} />
                                        </button>

                                        <div className="space-y-4 text-sm">
                                            <div className="flex items-center">
                                                <StatusBadge status={formatStatus(env.status)} />
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Domain:</span>
                                                    <span className={`font-medium ${env.domain ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                                        {env.domain || 'Not configured'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Branch:</span>
                                                    <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-xs font-bold">
                                                        {env.branch}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-gray-500">Deployed:</span>
                                                    <span className="text-gray-900">
                                                        {formatDate(env.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : isFiltering ? (
                // State: Trống do lọc không ra kết quả
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-200">
                        <FiSearch size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Không tìm thấy dự án</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        Không có dự án nào khớp với từ khóa hoặc bộ lọc của bạn. Hãy thử đổi điều kiện lọc.
                    </p>
                </div>
            ) : (
                // State: Trống hoàn toàn (Chưa tạo dự án nào)
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4 shadow-sm">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4 border border-indigo-100">
                        <FiBox size={32} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Chưa có dự án nào</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mb-6">
                        Bạn chưa triển khai dự án nào trên hệ thống. Hãy kết nối với GitHub và bắt đầu deploy ứng dụng đầu tiên của mình!
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/projects/new')}
                        className="cursor-pointer"
                    >
                        <FiPlus className="mr-2" /> Deploy First Project
                    </Button>
                </div>
            )}
        </div>
    );
};