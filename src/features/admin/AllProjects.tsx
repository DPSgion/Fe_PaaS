// src/features/admin/AllProjects.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiSquare, FiEye, FiMail, FiAlertTriangle } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';

// ============================================================================
// MOCK DATA & TYPES
// ============================================================================
type ProjectStatus = 'Running' | 'Stopped' | 'Crashed';

interface Project {
  id: string;
  name: string;
  owner: string;
  ownerEmail: string;
  branch: string;
  subdomain: string;
  cpu: number; // percentage
  ram: number; // MB
  status: ProjectStatus;
}

const mockProjects: Project[] = [
  { id: 'proj_1', name: 'Cupzone Backend', owner: 'phuong', ownerEmail: 'phuong@example.com', branch: 'main', subdomain: 'api.cupzone.vn', cpu: 17, ram: 400, status: 'Running' },
  { id: 'proj_2', name: 'Nong Trai Game', owner: 'khoa', ownerEmail: 'khoa@example.com', branch: 'dev', subdomain: 'dev.nongtrai.com', cpu: 0, ram: 0, status: 'Stopped' },
  { id: 'proj_3', name: 'AI English Master', owner: 'phuong', ownerEmail: 'phuong@example.com', branch: 'main', subdomain: 'learn.ai-english.vn', cpu: 85, ram: 1024, status: 'Running' },
  { id: 'proj_4', name: 'Test-App-01', owner: 'dev_01', ownerEmail: 'dev01@example.com', branch: 'feat/login', subdomain: 'test01.paas.com', cpu: 0, ram: 0, status: 'Crashed' },
  { id: 'proj_5', name: 'Payment Gateway', owner: 'khoa', ownerEmail: 'khoa@example.com', branch: 'staging', subdomain: 'pay-staging.com', cpu: 5, ram: 256, status: 'Running' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AllProjects = () => {
  // Filters State
  const [searchProject, setSearchProject] = useState('');
  const [searchDeveloper, setSearchDeveloper] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProjectStatus>('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Strict Modal State
  const [projectToStop, setProjectToStop] = useState<Project | null>(null);
  const [confirmStopText, setConfirmStopText] = useState('');

  // ==========================================================================
  // LOGIC HANDLERS
  // ==========================================================================
  
  // Lọc dữ liệu dựa trên các điều kiện
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      const matchProject = p.name.toLowerCase().includes(searchProject.toLowerCase());
      const matchDev = p.owner.toLowerCase().includes(searchDeveloper.toLowerCase()) || 
                       p.ownerEmail.toLowerCase().includes(searchDeveloper.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
      
      return matchProject && matchDev && matchStatus;
    });
  }, [searchProject, searchDeveloper, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize) || 1;

  // Xử lý mở Modal
  const handleOpenStopModal = (project: Project) => {
    setProjectToStop(project);
    setConfirmStopText(''); // Xóa trắng text mỗi lần mở
  };

  // Xử lý đóng Modal
  const handleCloseStopModal = () => {
    setProjectToStop(null);
    setConfirmStopText('');
  };

  // Xử lý Force Stop (Thực tế sẽ gọi API ở đây)
  const handleExecuteForceStop = () => {
    if (projectToStop && confirmStopText === projectToStop.name) {
      console.log(`Executing FORCE STOP on container for project: ${projectToStop.name}`);
      // TODO: Gọi API ngắt container
      handleCloseStopModal();
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      {/* 1. Header & Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
        <div className="space-y-4 flex-1">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">All Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {/* Filter Project */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 w-24">Project:</label>
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchProject}
                  onChange={(e) => setSearchProject(e.target.value)}
                  placeholder="Input project name" 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Filter Developer */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 w-24 md:w-auto">Developer:</label>
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchDeveloper}
                  onChange={(e) => setSearchDeveloper(e.target.value)}
                  placeholder="name / username / email" 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Count & Status Filter */}
        <div className="flex flex-col items-end justify-between min-w-[200px]">
          <div className="text-sm font-medium text-gray-600 mb-4 md:mb-0">
            Count: <span className="font-bold text-indigo-600 text-lg">{filteredProjects.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Status Filter:</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer font-medium"
            >
              <option value="ALL">ALL</option>
              <option value="Running" className="text-green-600 font-bold">Running</option>
              <option value="Stopped" className="text-gray-500 font-bold">Stopped</option>
              <option value="Crashed" className="text-red-600 font-bold">Crashed</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{project.name}</td>
                    <td className="px-6 py-4 font-medium">{project.owner}</td>
                    <td className="px-6 py-4"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{project.branch}</span></td>
                    <td className="px-6 py-4 text-indigo-600">{project.subdomain}</td>
                    <td className="px-6 py-4 font-mono text-purple-700 font-medium">
                      {project.status === 'Running' ? `${project.cpu} % / ${project.ram} MB` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium">
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          project.status === 'Running' ? 'bg-green-500' : 
                          project.status === 'Crashed' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className={
                          project.status === 'Running' ? 'text-green-700' : 
                          project.status === 'Crashed' ? 'text-red-600' : 'text-gray-500'
                        }>
                          {project.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-center">
                        {/* Hành động Show -> Trỏ tới AdminProjectDetail đã làm */}
                        <Link to={`/admin/projects/${project.id}`} className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer">
                          <FiEye size={14} /> Show
                        </Link>
                        
                        {/* Chỉ hiện Force Stop nếu đang Running */}
                        {project.status === 'Running' && (
                          <button 
                            onClick={() => handleOpenStopModal(project)}
                            className="text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 bg-red-50 hover:bg-red-100 px-2 py-1 rounded font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer transition-colors"
                          >
                            <FiSquare size={14} /> Force stop
                          </button>
                        )}

                        <a href={`mailto:${project.ownerEmail}?subject=[PaaS System] Notification regarding project ${project.name}`} className="text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1 text-xs uppercase cursor-pointer">
                          <FiMail size={14} /> Mail
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No projects found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-center items-center text-sm font-medium gap-4">
          <button 
            className={`transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            &lt; Trước
          </button>
          <span className="text-gray-600">
            Trang {currentPage} / {totalPages}
          </span>
          <button 
            className={`transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Tiếp &gt;
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STRICT CONFIRMATION MODAL - FORCE STOP */}
      {/* ========================================================================= */}
      {projectToStop && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-3">
              <FiAlertTriangle className="text-red-600 text-xl" />
              <h3 className="text-lg font-bold text-red-800">Force Stop Container</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                You are about to force stop the project <strong className="text-gray-900 font-bold">{projectToStop.name}</strong>. 
                This action will immediately kill the running Docker container and abruptly terminate all active connections.
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">
                  To confirm, please type <strong className="font-mono text-black select-all">{projectToStop.name}</strong> in the field below:
                </p>
                <input 
                  type="text" 
                  value={confirmStopText}
                  onChange={(e) => setConfirmStopText(e.target.value)}
                  className="w-full border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 p-2 font-mono text-sm outline-none"
                  placeholder="Type project name here..."
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={handleCloseStopModal} className="cursor-pointer">Cancel</Button>
              <Button 
                onClick={handleExecuteForceStop}
                disabled={confirmStopText !== projectToStop.name}
                className={`transition-all font-bold ${
                  confirmStopText === projectToStop.name 
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md cursor-pointer' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed border-transparent'
                }`}
              >
                I understand the consequences, force stop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};