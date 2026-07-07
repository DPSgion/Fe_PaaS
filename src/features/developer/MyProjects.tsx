import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiLoader, FiMoreVertical, FiBox } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { projectApi, type ProjectListResponse } from './api/projectApi';

export const MyProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<ProjectListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await projectApi.getMyProjects();
                setProjects(data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách dự án:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // THUẬT TOÁN GOM NHÓM Ở FRONTEND: 
    // Chuyển mảng phẳng thành Object: { "Project A": [nhánh main, nhánh dev], "Project B": [...] }
    const groupedProjects = useMemo(() => {
        return projects.reduce((acc, curr) => {
            // Chuẩn hóa tên để gom nhóm chính xác
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

    return (
        <div className="max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
            {/* Header giữ nguyên */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        Good Morning, Phuong 👋
                    </h1>
                    <p className="text-gray-500 mt-1">This is your projects</p>
                </div>
                <Button 
                    variant="primary" 
                    onClick={() => navigate('/projects/new')}
                    className="cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                    <FiPlus className="mr-1" /> Create New Projects
                </Button>
            </div>

            {/* Content Area */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
                    <FiLoader className="animate-spin" size={32} />
                    <p className="text-sm font-medium">Đang tải danh sách dự án...</p>
                </div>
            ) : projects.length > 0 ? (
                
                // KHU VỰC RENDER ĐÃ ĐƯỢC CHIA KHU
                <div className="space-y-12">
                    {Object.entries(groupedProjects).map(([projectName, envs]) => (
                        <div key={projectName} className="space-y-4">
                            {/* Tên Khu vực (Project Name gốc) */}
                            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                                <h2 className="text-xl font-bold text-gray-900 capitalize">{projectName}</h2>
                                <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-wider">
                                    [ Cài đặt dự án ]
                                </button>
                            </div>

                            {/* Danh sách các nhánh trượt ngang (Horizontal Scroll) */}
                            {/* Dùng snap-x để vuốt mượt trên điện thoại, scrollbar-hide để giấu thanh cuộn xấu xí */}
                            <div className="flex overflow-x-auto snap-x gap-6 pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar">
                                {envs.map((env) => (
                                    <div 
                                        key={env.id}
                                        onClick={() => navigate(`/project/${env.id}/env/default`)}
                                        // Cố định chiều rộng thẻ và thiết lập điểm neo (snap-start)
                                        className="min-w-[320px] max-w-[320px] shrink-0 snap-start bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
                                    >
                                        <button className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FiMoreVertical size={18} />
                                        </button>

                                        <div className="space-y-4 text-sm">
                                            {/* Trạng thái đập vào mắt đầu tiên */}
                                            <div className="flex items-center">
                                                <StatusBadge status={formatStatus(env.status)} />
                                            </div>

                                            {/* Thông tin cốt lõi */}
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

            ) : (
                // Empty State giữ nguyên
                <div className="bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center py-20 text-center px-4">
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