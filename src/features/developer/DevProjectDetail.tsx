import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiSquare, FiTerminal, FiDatabase, FiActivity, FiLoader, FiSettings, FiPlay, FiEye } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EnvVariablesTab } from './components/EnvVariablesTab';
import { projectApi, type ProjectDetailResponse, type ProjectMetricsResponse } from './api/projectApi';
import { ProjectSettingsTab } from './components/ProjectSettingsTab';
import { ResourceMetricsChart } from './components/ResourceMetricsChart';
import { DeployLogViewer } from './components/DeployLogViewer';

// ============================================================================
// LOCAL COMPONENTS (MOCK DATA)
// ============================================================================

const TabDeployHistory = ({ projectId, refreshTrigger }: { projectId: string, refreshTrigger: number }) => {
  const [histories, setHistories] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedDeployment, setSelectedDeployment] = useState<{ id: number, status: string } | null>(null);

  const fetchHistories = async (pageNumber: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await projectApi.getDeployHistories(projectId, pageNumber, 20);
      if (pageNumber === 0) {
        setHistories(data.content);
      } else {
        // Nối thêm dữ liệu mới vào mảng cũ khi cuộn
        setHistories(prev => [...prev, ...data.content]);
      }
      setIsLast(data.last);
    } catch (error) {
      console.error("Lỗi lấy lịch sử", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chạy lần đầu khi load trang VÀ chạy lại khi nhận được tín hiệu refresh
  useEffect(() => {
    setPage(0);        // Đưa về trang đầu tiên
    fetchHistories(0); // Lấy lại dữ liệu mới nhất
  }, [projectId, refreshTrigger]); // Theo dõi cả 2 biến

  // Chạy khi biến page thay đổi (do cuộn chuột)
  useEffect(() => {
    if (page > 0) fetchHistories(page);
  }, [page]);

  // Bắt sự kiện lăn chuột
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Nếu cuộn cách đáy 50px thì gọi API tiếp
    if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoading && !isLast) {
      setPage(prev => prev + 1);
    }
  };

  // Hàm render màu sắc gắt cho Status
  const renderStatus = (status: string) => {
    let colorClass = "bg-gray-100 text-gray-700 border-gray-300";
    if (status === 'SUCCESS') colorClass = "bg-green-100 text-green-700 border-green-300";
    if (status === 'FAILED') colorClass = "bg-red-100 text-red-700 border-red-300";
    if (status === 'BUILDING') colorClass = "bg-blue-100 text-blue-700 border-blue-300 animate-pulse";
    
    return <span className={`font-bold text-[10px] px-2 py-1 rounded border uppercase ${colorClass}`}>{status}</span>;
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Khung giới hạn chiều cao 500px, hiện thanh cuộn và gắn sự kiện onScroll */}
      <div 
        className="max-h-[500px] overflow-y-auto" 
        onScroll={handleScroll}
      >
        <table className="w-full text-sm text-left text-gray-600 relative">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 w-48 font-bold">Time</th>
              <th className="px-6 py-4 font-bold">Event (Status + Commit)</th>
              <th className="px-6 py-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {histories.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 align-top">
                  <div className="font-medium text-gray-900">
                    {item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : 'Đang khởi tạo...'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Build: {item.buildDuration}</div>
                </td>
                <td className="px-6 py-4 align-top">
                  <div className="flex items-center gap-3 mb-1">
                    {renderStatus(item.status)}
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200">
                      {item.commitSha}
                    </span>
                  </div>
                  <p className="text-gray-800 mt-2 font-medium">{item.commitMessage}</p>
                </td>
                <td className="px-6 py-4 align-top text-right">
                  <button
                    onClick={() => setSelectedDeployment({ id: item.id, status: item.status })}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-4 py-2 rounded shadow-sm transition-all cursor-pointer"
                  >
                    <FiEye size={14} /> View Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Hiển thị biểu tượng loading khi cuộn xuống */}
        {isLoading && (
          <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center gap-2">
            <FiLoader className="animate-spin" /> Đang tải thêm dữ liệu...
          </div>
        )}
      </div>

      <DeployLogViewer
        isOpen={selectedDeployment !== null}
        onClose={() => setSelectedDeployment(null)}
        deploymentId={selectedDeployment?.id || null}
        status={selectedDeployment?.status || 'STOPPED'}
        onDeployFinished={() => {
          setPage(0);
          fetchHistories(0);
        }}
      />
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

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [liveStats, setLiveStats] = useState({ cpu: '0', ram: '0' });

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
    if (projectId) {
      fetchDetail();
    }
  }, [projectId]);

  // Cơ chế Polling tự động kiểm tra trạng thái Build
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Nếu dự án đang BUILDING, cứ 3 giây tự động gọi API 1 lần
    if (project?.status === 'BUILDING') {
      interval = setInterval(() => {
        fetchDetail(); // Cập nhật Header (Đổi status, Container ID, RAM...)
        setRefreshTrigger(prev => prev + 1); // Cập nhật luôn bảng lịch sử bên dưới
      }, 3000); 
    }

    // Dọn dẹp interval khi component unmount hoặc khi trạng thái đã đổi xong
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [project?.status]);

  // Hàm xử lý khi bấm nút Redeploy
  const handleRedeploy = async () => {
    if (!projectId || !window.confirm("Bạn có chắc chắn muốn triển khai lại (redeploy) dự án này?")) return;

    setIsDeploying(true);
    try {
      const message = await projectApi.triggerDeploy(projectId);
      window.alert(message); 
      
      // SỬA GẮT: Thêm 2 dòng này để cập nhật UI ngay lập tức
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
            <span className="font-mono text-gray-900">{project.status === 'RUNNING' ? `${liveStats.cpu} %` : '0 %'}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24">Image:</span>
            <span className="font-mono text-gray-900">
              {metrics?.imageSize ? `${metrics.imageSize} MB` : 'N/A'}
            </span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24">MEM:</span>
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
          {/* GỌI COMPONENT BIỂU ĐỒ VỪA TẠO */}
          {projectId && (
            <ResourceMetricsChart 
               projectId={projectId} 
               onDataUpdate={(cpu: string, ram: string) => setLiveStats({ cpu, ram })} 
            />
          )}

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