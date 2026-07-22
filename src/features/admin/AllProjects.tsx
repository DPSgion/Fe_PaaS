import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiSquare, FiEye, FiMail, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { adminApi, type AdminProjectListResponse, type ProjectStatus } from './api/projectApi';
import { SendMailModal } from './components/SendMailModal';
import toast from 'react-hot-toast';

export const AllProjects = () => {
    // UI Filters State
    const [searchProject, setSearchProject] = useState('');
    const [searchDeveloper, setSearchDeveloper] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');

    // API Debounced Filters State
    const [debouncedFilters, setDebouncedFilters] = useState({ project: '', developer: '', status: 'ALL' });

    // Server-side Pagination & Data State
    const [projects, setProjects] = useState<AdminProjectListResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [projectToStop, setProjectToStop] = useState<AdminProjectListResponse | null>(null);
    const [confirmStopText, setConfirmStopText] = useState('');
    const [isForceStopping, setIsForceStopping] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // MAIL STATE
    const [mailProject, setMailProject] = useState<AdminProjectListResponse | null>(null);

    // ==========================================================================
    // LOGIC HANDLERS
    // ==========================================================================

    // 1. Debounce (Giảm tải cho Backend khi gõ tìm kiếm)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters({
                project: searchProject,
                developer: searchDeveloper,
                status: statusFilter
            });
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchProject, searchDeveloper, statusFilter]);

    // 2. Gọi Backend Spring Boot API
    useEffect(() => {
        const fetchProjects = async () => {
            setIsLoading(true);
            try {
                const pageIndex0Based = currentPage - 1;
                const response = await adminApi.getAllProjects(
                    debouncedFilters.project,
                    debouncedFilters.developer,
                    debouncedFilters.status,
                    pageIndex0Based,
                    pageSize
                );
                setProjects(response.content);
                setTotalPages(response.totalPages);
                setTotalElements(response.totalElements);
            } catch (error) {
                console.error("Lỗi lấy danh sách dự án:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [debouncedFilters, currentPage, refreshTrigger]);

    // 3. Modal Handlers
    const handleOpenStopModal = (project: AdminProjectListResponse) => {
        setProjectToStop(project);
        setConfirmStopText('');
    };

    const handleExecuteForceStop = async () => {
        if (projectToStop && confirmStopText === projectToStop.projectName) {
            setIsForceStopping(true);
            try {
                const msg = await adminApi.forceStopProject(projectToStop.projectId);
                toast.success(msg || "Đã ép dừng thành công!");

                // Đóng Modal và làm mới bảng ngay lập tức
                setProjectToStop(null);
                setConfirmStopText('');
                setRefreshTrigger(prev => prev + 1);
            } catch (error: any) {
                const errMsg = error.response?.data?.message || "Lỗi mạng khi ép dừng dự án.";
                toast.error(errMsg, { duration: 5000 });
            } finally {
                setIsForceStopping(false);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in duration-300">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">All Projects</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 w-24">Project:</label>
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchProject}
                                    onChange={(e) => setSearchProject(e.target.value)}
                                    placeholder="Input project name"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-sm font-semibold text-gray-700 w-24 md:w-auto">Developer:</label>
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchDeveloper}
                                    onChange={(e) => setSearchDeveloper(e.target.value)}
                                    placeholder="Username"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between min-w-[200px]">
                    <div className="text-sm font-medium text-gray-600 mb-4 md:mb-0 flex items-center gap-2">
                        Total Projects:
                        {isLoading ? <FiLoader className="animate-spin text-indigo-600" /> : <span className="font-bold text-indigo-600 text-lg">{totalElements}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-sm font-semibold text-gray-700">Status Filter:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer font-medium"
                        >
                            <option value="ALL">ALL</option>
                            <option value="RUNNING" className="text-green-600 font-bold">RUNNING</option>
                            <option value="STOPPED" className="text-gray-500 font-bold">STOPPED</option>
                            <option value="CRASHED" className="text-red-600 font-bold">CRASHED</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative min-h-[300px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-indigo-600">
                            <FiLoader size={30} className="animate-spin" />
                            <span className="font-semibold text-sm">Đang lấy dữ liệu từ Server...</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Project Name</th>
                                <th className="px-6 py-4">Owner</th>
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4">Subdomain</th>
                                <th className="px-6 py-4">CPU / RAM</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isLoading && projects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Không tìm thấy dự án nào khớp với bộ lọc.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.projectId} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{project.projectName}</td>
                                        <td className="px-6 py-4 font-medium">{project.ownerUsername}</td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">{project.branch}</span>
                                        </td>
                                        <td className="px-6 py-4 text-indigo-600">{project.subdomain}</td>
                                        <td className="px-6 py-4 font-mono font-medium">
                                            {project.status === 'RUNNING' && project.cpuUsage !== null && project.ramUsage !== null ? (
                                                <span className="text-purple-700">{project.cpuUsage}% / {project.ramUsage} MB</span>
                                            ) : (
                                                <span className="text-gray-400 italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-medium">
                                                <div className={`w-2.5 h-2.5 rounded-full ${project.status === 'RUNNING' ? 'bg-green-500 animate-pulse' :
                                                        project.status === 'CRASHED' ? 'bg-red-500' : 'bg-gray-400'
                                                    }`}></div>
                                                <span className={
                                                    project.status === 'RUNNING' ? 'text-green-700' :
                                                        project.status === 'CRASHED' ? 'text-red-600' : 'text-gray-500'
                                                }>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-center">
                                                <Link to={`/admin/projects/${project.projectId}`} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer transition-colors">
                                                    <FiEye size={14} /> Show
                                                </Link>

                                                {project.status === 'RUNNING' && (
                                                    <button
                                                        onClick={() => handleOpenStopModal(project)}
                                                        className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-2 py-1 rounded font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer transition-colors"
                                                    >
                                                        <FiSquare size={14} /> Force stop
                                                    </button>
                                                )}

                                                {/* SỬA GẮT: Thay thẻ a mailto cũ bằng nút mở Modal SendMail */}
                                                <button 
                                                    onClick={() => setMailProject(project)}
                                                    className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer transition-colors"
                                                >
                                                    <FiMail size={14} /> Mail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-center items-center text-sm font-medium gap-4">
                    <button
                        className={`transition-colors flex items-center gap-1 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer text-indigo-600 hover:text-indigo-800'}`}
                        disabled={currentPage === 1 || isLoading}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        &lt; Previous
                    </button>
                    <span className="text-gray-600 bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={`transition-colors flex items-center gap-1 ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer text-indigo-600 hover:text-indigo-800'}`}
                        disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next &gt;
                    </button>
                </div>
            </div>

            {/* STRICT CONFIRMATION MODAL - FORCE STOP */}
            {projectToStop && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <FiAlertTriangle className="text-red-600 text-xl" />
                            <h3 className="text-lg font-bold text-red-800">Force Stop Container</h3>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700">
                                You are about to force stop the project <strong className="text-gray-900 font-bold">{projectToStop.projectName}</strong>.
                                This action will immediately kill the running Docker container and abruptly terminate all active connections.
                            </p>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">
                                    To confirm, please type <strong className="font-mono text-black select-all bg-gray-200 px-1 py-0.5 rounded">{projectToStop.projectName}</strong> in the field below:
                                </p>
                                <input
                                    type="text"
                                    value={confirmStopText}
                                    onChange={(e) => setConfirmStopText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 p-2.5 font-mono text-sm outline-none transition-all"
                                    placeholder="Type project name here..."
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setProjectToStop(null);
                                    setConfirmStopText('');
                                }}
                                className="cursor-pointer"
                                disabled={isForceStopping}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleExecuteForceStop}
                                disabled={confirmStopText !== projectToStop.projectName || isForceStopping}
                                className={`transition-all font-bold ${confirmStopText === projectToStop.projectName
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border-transparent'
                                    }`}
                            >
                                {isForceStopping ? <FiLoader className="animate-spin" /> : 'Force Stop'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* SỬA GẮT: Render Component SendMailModal ở gốc (Root) của file */}
            {mailProject && (
                <SendMailModal 
                    project={mailProject} 
                    onClose={() => setMailProject(null)} 
                />
            )}
        </div>
    );
};