import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiSquare, FiTerminal, FiDatabase, FiActivity, FiLoader, FiSettings, FiPlay } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EnvVariablesTab } from './components/EnvVariablesTab';
import { projectApi, type ProjectDetailResponse, type ProjectMetricsResponse } from './api/projectApi';
import { ProjectSettingsTab } from './components/ProjectSettingsTab';

// ============================================================================
// LOCAL COMPONENTS (MOCK DATA)
// ============================================================================

const TabDeployHistory = ({ projectId }: { projectId: string }) => {
  const [histories, setHistories] = useState<any[]>([]);

  useEffect(() => {
    projectApi.getDeployHistories(projectId).then(setHistories);
  }, [projectId]);

  return (
    <div className="animate-in fade-in duration-300">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 w-48">Time (Time to build)</th>
            <th className="px-6 py-3">Event (Deploy status + commit_sha)</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((item) => (
            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4 align-top">
                <div className="font-medium text-gray-900">{item.time}</div>
                <div className="text-xs text-gray-500 mt-1">Build: {item.buildTime}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <StatusBadge status={item.status} />
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{item.commitSha}</span>
                </div>
                <p className="text-gray-700 mt-2">{item.message}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TabTerminalLogs = () => {
  return (
    <div className="animate-in fade-in duration-300 p-4">
      <div className="bg-gray-950 rounded-lg shadow-inner p-4 h-[400px] overflow-y-auto font-mono text-sm">
        <div className="text-gray-500 mb-4">Connected to container logging stream...</div>
        <div className="text-green-400">[info] Server starting on port 8080</div>
        <div className="text-green-400">[info] Connecting to database...</div>
        <div className="text-green-400">[info] Database connected successfully.</div>
        <div className="text-yellow-400">[warn] Missing optional ENV variable: REDIS_URL</div>
        <div className="text-green-400">[info] App is running and ready to receive requests.</div>
        <div className="mt-2 text-gray-300 flex items-center">
          <span className="text-blue-400 mr-2">root@paas:/app#</span> <span className="w-2 h-4 bg-gray-300 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT (REAL DATA DYNAMICS)
// ============================================================================

interface DevProjectDetailProps {
  mode?: 'developer' | 'admin';
}

export const DevProjectDetail = ({ mode = 'developer' }: DevProjectDetailProps) => {
  const isAdmin = mode === 'admin';
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState<'deploy' | 'env' | 'logs' | 'settings'>('deploy');

  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [metrics, setMetrics] = useState<ProjectMetricsResponse | null>(null);

  const fetchDetail = async () => {
    try {
      // Dùng Promise.all để lấy dữ liệu song song
      const [projectData, metricsData] = await Promise.all([
        projectApi.getProjectDetail(projectId as string),
        projectApi.getProjectMetrics(projectId as string).catch(() => null) // Nếu lỗi lấy metrics (do chưa deploy) thì bỏ qua, không làm chết trang
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
    if (projectId) fetchDetail();
  }, [projectId]);

  // Hàm xử lý khi bấm nút Redeploy
  const handleRedeploy = async () => {
    if (!projectId || !window.confirm("Bạn có chắc chắn muốn triển khai lại (redeploy) dự án này?")) return;

    setIsDeploying(true);
    try {
      const message = await projectApi.triggerDeploy(projectId);
      window.alert(message); // Hiện thông báo "Tiến trình triển khai đang được chạy ngầm..."
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
      window.alert(message); // Hiển thị thông báo thành công
      fetchDetail(); // Gọi lại hàm fetchDetail để cập nhật trạng thái UI sang RUNNING
    } catch (error: any) {
      // Hứng lỗi (chưa từng deploy, hoặc lén xóa container trên VPS)
      const msg = error.response?.data?.message || "Lỗi khi khởi động lại dự án.";
      window.alert(msg);
    } finally {
      setIsRestarting(false);
    }
  };

  const handleStop = async () => {
    // Cảnh báo rõ ràng vì thao tác này làm gián đoạn dịch vụ
    if (!projectId || !window.confirm("Bạn có chắc chắn muốn dừng (stop) dự án này? Ứng dụng sẽ không thể truy cập cho đến khi được bật lại.")) return;

    setIsStopping(true);
    try {
      const message = await projectApi.stopProject(projectId);
      window.alert(message);
      fetchDetail(); // Gọi lại để đổi StatusBadge thành STOPPED
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
      fetchDetail(); // Gọi lại để đổi StatusBadge thành RUNNING
    } catch (error: any) {
      const msg = error.response?.data?.message || "Lỗi khi khởi động dự án.";
      window.alert(msg);
    } finally {
      setIsStarting(false);
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
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm flex items-center gap-2 cursor-pointer">
                <FiSquare size={16} /> FORCE STOP
              </Button>
            ) : (
              <>
                {/* NÚT REDEPLOY */}
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleRedeploy}
                  disabled={isDeploying || project.status === 'BUILDING'}
                >
                  {isDeploying ? <FiLoader className="mr-2 animate-spin" /> : <FiRefreshCw className="mr-2" />}
                  {isDeploying ? 'Deploying...' : 'Redeploy'}
                </Button>

                {/* NÚT RESTART (Đã sửa vị trí và thay thế nút cũ) */}
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleRestart}
                  disabled={isRestarting || isDeploying || project.status === 'BUILDING'}
                >
                  {isRestarting ? <FiLoader className="mr-2 animate-spin" /> : <FiRefreshCw className="mr-2" />}
                  {isRestarting ? 'Restarting...' : 'Restart'}
                </Button>

                {/* NÚT START / STOP (Hoán đổi tự động) */}
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
            <span className="font-mono text-gray-900">{project.status === 'RUNNING' ? '12 %' : '0 %'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24">Image:</span>
            <span className="font-mono text-gray-900">
              {metrics?.imageSize ? `${metrics.imageSize} MB` : 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24">MEM:</span>
            <span className="font-mono text-gray-900">{project.status === 'RUNNING' ? '1.2 GB' : '0 GB'}</span>
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
          {activeTab === 'deploy' && projectId && <TabDeployHistory projectId={projectId} />}
          {activeTab === 'env' && projectId && <EnvVariablesTab projectId={projectId} />}
          {activeTab === 'logs' && <TabTerminalLogs />}
          {activeTab === 'settings' && project && projectId && (
            <ProjectSettingsTab
              projectId={projectId}
              initialData={project}
              onUpdateSuccess={fetchDetail}
            />
          )}
        </div>
      </div>

      {/* 4. Chart & Danger Zone */}
      {!isAdmin && (
        <>
          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm opacity-60">
            <h3 className="text-sm font-bold text-orange-600 mb-6">Image Size History (Mocked Data)</h3>
            <div className="h-64 w-full relative flex items-end">
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 font-mono text-right pr-2 border-r border-gray-800">
                <span>700 MB</span>
                <span>400 MB</span>
                <span>0</span>
              </div>
              <div className="absolute left-12 right-0 bottom-8 border-t border-gray-800"></div>
              <div className="absolute left-12 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-500 px-4">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span className="text-right">Successful<br />Deploys Times</span>
              </div>
              <svg className="absolute left-12 right-0 top-0 bottom-8 w-[calc(100%-3rem)] h-full" preserveAspectRatio="none">
                <polyline points="0,150 100,50 250,80 400,70 550,90" fill="none" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="100" cy="50" r="4" fill="#4f46e5" />
              </svg>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-800">Delete Project</h3>
              <p className="text-xs text-red-600 mt-1 max-w-md">
                Project must be in <strong>stop status</strong>. Send email to confirm and developer need to approve.
              </p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400 cursor-pointer">
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
};