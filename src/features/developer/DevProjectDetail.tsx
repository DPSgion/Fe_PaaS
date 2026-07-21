import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiSquare, FiTerminal, FiDatabase, FiActivity, FiLoader, FiSettings, FiPlay, FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EnvVariablesTab } from './components/EnvVariablesTab';
import { projectApi, type ProjectDetailResponse, type ProjectMetricsResponse } from './api/projectApi';
import { ProjectSettingsTab } from './components/ProjectSettingsTab';
import { ResourceMetricsChart } from './components/ResourceMetricsChart';
import { TabDeployHistory } from './components/TabDeployHistory';
import { TabTerminalLogs } from './components/TabTerminalLogs';
import { adminApi } from '../admin/api/projectApi';

interface DevProjectDetailProps {
    mode?: 'developer' | 'admin';
}

export const DevProjectDetail = ({ mode = 'developer' }: DevProjectDetailProps) => {
    const isAdmin = mode === 'admin';
    const { projectId } = useParams();
    const navigate = useNavigate(); // SỬA GẮT: Thêm hook này để đá về trang chủ sau khi xóa
    const [activeTab, setActiveTab] = useState<'deploy' | 'env' | 'logs' | 'settings'>('deploy');

    const [project, setProject] = useState<ProjectDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeploying, setIsDeploying] = useState(false);
    const [isRestarting, setIsRestarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [metrics, setMetrics] = useState<ProjectMetricsResponse | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [liveStats, setLiveStats] = useState({ cpu: '0', ram: '0' });

    // --- STATES: FORCE STOP (ADMIN) ---
    const [isForceStopModalOpen, setIsForceStopModalOpen] = useState(false);
    const [confirmStopText, setConfirmStopText] = useState('');
    const [isForceStopping, setIsForceStopping] = useState(false);

    // --- STATES: DELETE PROJECT (DEVELOPER) ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [isRequestingDelete, setIsRequestingDelete] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // =========================================================
    // HANDLERS
    // =========================================================
    const fetchDetail = async () => {
        try {
            const [projectData, metricsData] = await Promise.all([
                projectApi.getProjectDetail(projectId as string),
                projectApi.getProjectMetrics(projectId as string).catch(() => null)
            ]);
            setProject(projectData);
            if (metricsData) setMetrics(metricsData);
        } catch (error) {
            console.error("Lỗi lấy chi tiết dự án", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) {
            fetchDetail();
        }
    }, [projectId]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (project?.status === 'BUILDING') {
            interval = setInterval(() => {
                fetchDetail();
                setRefreshTrigger(prev => prev + 1);
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [project?.status]);

    const handleRedeploy = async () => {
        if (!projectId || !window.confirm("Bạn có chắc chắn muốn triển khai lại (redeploy) dự án này?")) return;
        setIsDeploying(true);
        try {
            const message = await projectApi.triggerDeploy(projectId);
            window.alert(message);
            fetchDetail();
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi kích hoạt deploy.";
            window.alert(msg);
        } finally {
            setIsDeploying(false);
        }
    };

    const handleRestart = async () => {
        if (!projectId || !window.confirm("Bạn có chắc chắn muốn khởi động lại (restart) dự án này?")) return;
        setIsRestarting(true);
        try {
            const message = await projectApi.restartProject(projectId);
            window.alert(message);
            fetchDetail();
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi khởi động lại dự án.";
            window.alert(msg);
        } finally {
            setIsRestarting(false);
        }
    };

    const handleStop = async () => {
        if (!projectId || !window.confirm("Bạn có chắc chắn muốn dừng (stop) dự án này? Ứng dụng sẽ không thể truy cập cho đến khi được bật lại.")) return;
        setIsStopping(true);
        try {
            const message = await projectApi.stopProject(projectId);
            window.alert(message);
            fetchDetail();
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi dừng dự án.";
            window.alert(msg);
        } finally {
            setIsStopping(false);
        }
    };

    const handleStart = async () => {
        if (!projectId) return;
        setIsStarting(true);
        try {
            const message = await projectApi.startProject(projectId);
            window.alert(message);
            fetchDetail();
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Lỗi khi khởi động dự án.";
            window.alert(msg);
        } finally {
            setIsStarting(false);
        }
    };

    const handleExecuteForceStop = async () => {
        if (project && confirmStopText === project.projectName && projectId) {
            setIsForceStopping(true);
            try {
                const msg = await adminApi.forceStopProject(projectId);
                window.alert(msg || "Đã ép dừng thành công!");
                setIsForceStopModalOpen(false);
                setConfirmStopText('');
                fetchDetail();
                setRefreshTrigger(prev => prev + 1);
            } catch (error: any) {
                const errMsg = error.response?.data?.message || "Lỗi khi ép dừng dự án.";
                window.alert(errMsg);
            } finally {
                setIsForceStopping(false);
            }
        }
    };

    // --- SỬA GẮT: LOGIC GỌI API DELETE ---
    const handleRequestDelete = async () => {
        if (!projectId || project?.status !== 'STOPPED') return;
        if (!window.confirm(`XÁC NHẬN: Bạn muốn yêu cầu xóa dự án ${project.projectName}? Hệ thống sẽ gửi email OTP cho bạn.`)) return;
        
        setIsRequestingDelete(true);
        try {
            const msg = await projectApi.requestDeleteProject(projectId);
            window.alert(msg); // Hiện popup "Mã xác nhận đã gửi đến email..."
            setIsDeleteModalOpen(true);
        } catch (error: any) {
            const errMsg = error.response?.data?.message || "Lỗi khi yêu cầu xóa dự án.";
            window.alert(errMsg);
        } finally {
            setIsRequestingDelete(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!projectId || otpCode.trim().length < 6) return;
        
        setIsConfirmingDelete(true);
        try {
            const msg = await projectApi.confirmDeleteProject(projectId, otpCode);
            window.alert(msg || "Dự án đã được xóa thành công!");
            setIsDeleteModalOpen(false);
            
            // Đá người dùng về trang danh sách vì dự án hiện tại đã "bốc hơi"
            navigate('/my-projects', { replace: true });
        } catch (error: any) {
            const errMsg = error.response?.data?.message || "Mã xác nhận không hợp lệ hoặc đã hết hạn.";
            window.alert(errMsg);
        } finally {
            setIsConfirmingDelete(false);
        }
    };

    const formatStatus = (backendStatus: string) => {
        switch (backendStatus) {
            case 'CRASHED': return 'Failed';
            case 'BUILDING': return 'Building';
            case 'RUNNING': return 'Running';
            default: return 'Stopped';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 gap-4">
                <FiLoader className="animate-spin" size={40} />
                <p className="font-medium text-lg">Đang kết nối đến dự án...</p>
            </div>
        );
    }

    if (!project) return <div className="text-center p-20 text-red-500 font-bold text-xl">Không tìm thấy thông tin dự án!</div>;

    return (
        <div className="max-w-6xl mx-auto pb-12 space-y-8 animate-in fade-in duration-300">
            {/* 1. Header & Navigation */}
            <div>
                <Link
                    to={isAdmin ? "/admin/all-projects" : "/my-projects"}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 font-medium mb-4 transition-colors"
                >
                    <FiArrowLeft /> {isAdmin ? "Back to ALL PROJECTS" : "Back to your projects"}
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-900 capitalize">
                            {project.projectName}
                            <span className="ml-2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-lg font-mono lowercase">
                                ({project.branch})
                            </span>
                        </h2>
                        <StatusBadge status={formatStatus(project.status)} />
                    </div>
                    <div className="flex gap-3">
                        {isAdmin ? (
                            <Button 
                                onClick={() => setIsForceStopModalOpen(true)}
                                disabled={project.status !== 'RUNNING'}
                                className={`font-bold border-none shadow-sm flex items-center gap-2 transition-all ${
                                    project.status === 'RUNNING' 
                                    ? '!bg-red-600 hover:!bg-red-700 !text-white cursor-pointer' 
                                    : '!bg-gray-200 hover:!bg-gray-200 !text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <FiSquare size={16} /> FORCE STOP
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={handleRedeploy}
                                    disabled={isDeploying || project.status === 'BUILDING'}
                                >
                                    {isDeploying ? <FiLoader className="mr-2 animate-spin" /> : <FiRefreshCw className="mr-2" />}
                                    {isDeploying ? 'Deploying...' : 'Redeploy'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={handleRestart}
                                    disabled={isRestarting || isDeploying || project.status === 'BUILDING'}
                                >
                                    {isRestarting ? <FiLoader className="mr-2 animate-spin" /> : <FiRefreshCw className="mr-2" />}
                                    {isRestarting ? 'Restarting...' : 'Restart'}
                                </Button>
                                {project.status === 'STOPPED' ? (
                                    <Button
                                        className="!bg-green-600 hover:!bg-green-700 !text-white font-semibold !border-none shadow-sm cursor-pointer"
                                        onClick={handleStart}
                                        disabled={isStarting || isDeploying || isRestarting}
                                    >
                                        {isStarting ? <FiLoader className="mr-2 animate-spin" /> : <FiPlay className="mr-2" />}
                                        {isStarting ? 'Starting...' : 'Start'}
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50 hover:border-red-200 cursor-pointer"
                                        onClick={handleStop}
                                        disabled={isStopping || isDeploying || isRestarting || project.status === 'BUILDING'}
                                    >
                                        {isStopping ? <FiLoader className="mr-2 animate-spin" /> : <FiSquare className="mr-2" />}
                                        {isStopping ? 'Stopping...' : 'Stop'}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Project Info Block */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm w-full">
                    <div className="flex">
                        <span className="text-gray-500 w-24">Domain:</span>
                        <span className={`font-medium ${project.domain ? 'text-indigo-600' : 'text-gray-400 italic'}`}>
                            {project.domain || 'Not configured'}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="text-gray-500 w-24">CPU:</span>
                        <span className="font-mono text-gray-900">{project.status === 'RUNNING' ? `${liveStats.cpu} %` : '0 %'}</span>
                    </div>
                    <div className="flex">
                        <span className="text-gray-500 w-24">Image:</span>
                        <span className="font-mono text-gray-900">
                            {metrics?.imageSize ? `${metrics.imageSize} MB` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex">
                        <span className="text-gray-500 w-24">RAM:</span>
                        <span className="font-mono text-gray-900">{project.status === 'RUNNING' ? liveStats.ram : '0 MB'}</span>
                    </div>
                    <div className="flex">
                        <span className="text-gray-500 w-24">Container ID:</span>
                        <span className="font-mono text-gray-500">
                            {metrics?.containerId ? metrics.containerId.substring(0, 12) : 'N/A'}
                        </span>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="whitespace-nowrap cursor-pointer">Add Custom Domain</Button>
            </div>

            {/* 3. Tabs Area */}
            <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 bg-gray-50 px-2 pt-2">
                    <button
                        onClick={() => setActiveTab('deploy')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'deploy' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <FiActivity /> Deploy Histories
                    </button>
                    <button
                        onClick={() => setActiveTab('env')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'env' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <FiDatabase /> Environment Variables (ENV)
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <FiTerminal /> Terminal Logs
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${activeTab === 'settings' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                    >
                        <FiSettings /> Settings
                    </button>
                </div>
                <div className="bg-white min-h-[400px]">
                    {activeTab === 'deploy' && projectId && <TabDeployHistory projectId={projectId} refreshTrigger={refreshTrigger} />}
                    {activeTab === 'env' && projectId && <EnvVariablesTab projectId={projectId} />}
                    {activeTab === 'logs' && projectId && <TabTerminalLogs projectId={projectId} />}
                    {activeTab === 'settings' && project && projectId && (
                        <ProjectSettingsTab
                            projectId={projectId}
                            initialData={project}
                            onUpdateSuccess={fetchDetail}
                        />
                    )}
                </div>
            </div>

            {/* 4. Chart */}
            {projectId && (
                <ResourceMetricsChart
                    projectId={projectId}
                    onDataUpdate={(cpu: string, ram: string) => setLiveStats({ cpu, ram })}
                />
            )}

            {/* 5. Danger Zone (Chỉ ẩn cái này với Admin) */}
            {!isAdmin && (
                <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-red-800">Delete Project</h3>
                        <p className="text-xs text-red-600 mt-1 max-w-md">
                            Project must be in <strong className="uppercase">stopped</strong> status. We will send an OTP email to confirm this action.
                        </p>
                    </div>
                    {/* SỬA GẮT: Nối API Request Delete và khóa nút nếu không phải STOPPED */}
                    <Button 
                        variant="outline" 
                        onClick={handleRequestDelete}
                        disabled={project.status !== 'STOPPED' || isRequestingDelete}
                        className={`font-semibold border-red-300 transition-colors ${
                            project.status === 'STOPPED' 
                            ? 'text-red-600 hover:bg-red-600 hover:text-white cursor-pointer' 
                            : 'text-red-300 bg-red-50 cursor-not-allowed'
                        }`}
                    >
                        {isRequestingDelete ? <FiLoader className="animate-spin" /> : 'Delete Project'}
                    </Button>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL KHU VỰC */}
            {/* ========================================================= */}

            {/* STRICT CONFIRMATION MODAL - FORCE STOP (Dành riêng cho Admin) */}
            {isAdmin && isForceStopModalOpen && project && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <FiAlertTriangle className="text-red-600 text-xl" />
                            <h3 className="text-lg font-bold text-red-800">Force Stop Container</h3>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700">
                                You are about to force stop the project <strong className="text-gray-900 font-bold">{project.projectName}</strong>. 
                                This action will immediately kill the running Docker container and abruptly terminate all active connections.
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="text-xs text-gray-600 mb-2">
                                    To confirm, please type <strong className="font-mono text-black select-all bg-gray-200 px-1 py-0.5 rounded">{project.projectName}</strong> in the field below:
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
                                    setIsForceStopModalOpen(false);
                                    setConfirmStopText('');
                                }} 
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleExecuteForceStop}
                                disabled={confirmStopText !== project.projectName || isForceStopping}
                                className={`transition-all font-bold ${
                                    confirmStopText === project.projectName 
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

            {/* SỬA GẮT: OTP CONFIRMATION MODAL - DELETE PROJECT (Dành cho Developer) */}
            {!isAdmin && isDeleteModalOpen && project && (
                <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
                            <FiAlertTriangle className="text-red-600 text-xl" />
                            <h3 className="text-lg font-bold text-red-800">Confirm Delete Project</h3>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-700">
                                We have sent a 6-digit OTP code to your email. Please check your inbox and enter the code below to permanently delete <strong className="text-gray-900 font-bold">{project.projectName}</strong>.
                            </p>
                            
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">OTP Code</label>
                                <input 
                                    type="text" 
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 p-3 font-mono text-center text-2xl tracking-[0.5em] outline-none transition-all placeholder:text-gray-300"
                                    placeholder="------"
                                    maxLength={6}
                                    autoComplete="off"
                                    autoFocus
                                />
                            </div>
                        </div>
                        
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <Button 
                                variant="outline" 
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setOtpCode('');
                                }} 
                                className="cursor-pointer"
                                disabled={isConfirmingDelete}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirmDelete}
                                disabled={otpCode.length < 6 || isConfirmingDelete}
                                className={`transition-all font-bold flex items-center justify-center min-w-[140px] ${
                                    otpCode.length >= 6
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed border-transparent'
                                }`}
                            >
                                {isConfirmingDelete ? <FiLoader className="animate-spin mr-2" /> : null}
                                {isConfirmingDelete ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};