// src/features/developer/DevProjectDetail.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiRefreshCw, FiSquare, FiPlus, FiEdit2, FiTrash2, FiTerminal, FiDatabase, FiActivity } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';

// ============================================================================
// LOCAL COMPONENTS
// ============================================================================

const TabDeployHistory = () => {
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
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 align-top">
              <div className="font-medium text-gray-900">12/05/2026 14:30</div>
              <div className="text-xs text-gray-500 mt-1">Build: 2m 15s</div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="Success" />
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">a1b2c3d4</span>
              </div>
              <p className="text-gray-700 mt-2">feat: update payment gateway</p>
            </td>
          </tr>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 align-top">
              <div className="font-medium text-gray-900">11/05/2026 09:15</div>
              <div className="text-xs text-gray-500 mt-1">Build: 1m 50s</div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status="Failed" />
                <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">f9e8d7c6</span>
              </div>
              <p className="text-gray-700 mt-2">fix: resolve memory leak issue</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const TabEnvironmentVariables = ({ isAdmin }: { isAdmin?: boolean }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header của Tab ENV */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          Environment Variables 
          {isAdmin && <span className="text-orange-500 text-xs font-normal bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">(Read-Only)</span>}
        </h3>
        
        {/* Chỉ hiện nút Add nếu KHÔNG PHẢI là Admin */}
        {!isAdmin && (
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            <FiPlus className="mr-1" /> Add
          </Button>
        )}
      </div>

      {/* Table ENV */}
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 w-1/3">Key</th>
            <th className="px-6 py-3">Value</th>
            {/* Ẩn cột Action nếu là Admin */}
            {!isAdmin && <th className="px-6 py-3 text-right">Action</th>}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 font-mono text-gray-900">port</td>
            <td className="px-6 py-4 font-mono">8080</td>
            {!isAdmin && (
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-600 hover:text-indigo-800 mr-3"><FiEdit2 size={16} /></button>
                <button className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>
              </td>
            )}
          </tr>
          <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 font-mono text-gray-900">db_pass</td>
            <td className="px-6 py-4 font-mono">******</td>
            {!isAdmin && (
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-600 hover:text-indigo-800 mr-3"><FiEdit2 size={16} /></button>
                <button className="text-red-600 hover:text-red-800"><FiTrash2 size={16} /></button>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {/* Modal Add ENV */}
      {isModalOpen && !isAdmin && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border-2 border-green-500 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add Variable</h3>
            </div>
            
            {/* TODO 1: Tích hợp React Hook Form + Zod để validate input. Xử lý logic ẩn mã (******) nếu check vào ô Secrets */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="e.g. API_KEY" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <textarea rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" placeholder="Enter value..."></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isSecret" className="w-4 h-4 text-green-600 rounded focus:ring-green-500 cursor-pointer" />
                <label htmlFor="isSecret" className="text-sm text-gray-700 cursor-pointer">Secrets (Hide value after save)</label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TabTerminalLogs = () => {
  return (
    <div className="animate-in fade-in duration-300 p-4">
      {/* TODO 2: Chuyển sang kết nối WebSocket (lib/websocket.ts). Chỉ lưu trữ buffer tối đa 500-1000 dòng log mới nhất để tránh tràn RAM trình duyệt. */}
      <div className="bg-gray-950 rounded-lg shadow-inner p-4 h-[400px] overflow-y-auto font-mono text-sm">
        <div className="text-gray-500 mb-4">Connected to container kdfgo34uesdfn2...</div>
        <div className="text-green-400">[info] Server starting on port 8080</div>
        <div className="text-green-400">[info] Connecting to database...</div>
        <div className="text-green-400">[info] Database connected successfully.</div>
        <div className="text-yellow-400">[warn] Missing optional ENV variable: REDIS_URL</div>
        <div className="text-green-400">[info] App is running and ready to receive requests.</div>
        <div className="text-gray-400 mt-2">~ GET /api/health - 200 OK (12ms)</div>
        <div className="text-gray-400">~ GET /api/users - 200 OK (45ms)</div>
        <div className="mt-2 text-gray-300 flex items-center">
          <span className="text-blue-400 mr-2">root@paas:/app#</span> <span className="w-2 h-4 bg-gray-300 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface DevProjectDetailProps {
  mode?: 'developer' | 'admin';
}

export const DevProjectDetail = ({ mode = 'developer' }: DevProjectDetailProps) => {
  const isAdmin = mode === 'admin';
  const [activeTab, setActiveTab] = useState<'deploy' | 'env' | 'logs'>('deploy');

  // TODO 3: Khi có API thật, import useParams từ 'react-router-dom' để lấy projectId và envId thay vì hardcode.

  return (
    <div className="max-w-6xl mx-auto pb-12 space-y-8">
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
            <h2 className="text-2xl font-bold text-gray-900">Project A <span className="text-gray-500 text-lg font-normal">(main)</span></h2>
            <StatusBadge status="Running" />
          </div>
          <div className="flex gap-3">
            {isAdmin ? (
              // Nút của Admin
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold border-none shadow-sm flex items-center gap-2">
                <FiSquare size={16} /> FORCE STOP
              </Button>
            ) : (
              // Nút của Developer
              <>
                <Button variant="outline"><FiRefreshCw className="mr-2" /> Redeploy</Button>
                <Button variant="outline"><FiRefreshCw className="mr-2" /> Restart</Button>
                <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:border-red-200"><FiSquare className="mr-2" /> Stop</Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Project Info Block */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
          <div className="flex"><span className="text-gray-500 w-24">Domain:</span> <span className="font-medium text-gray-900">project-a.paas.com</span></div>
          <div className="flex"><span className="text-gray-500 w-24">CPU:</span> <span className="font-mono text-gray-900">12 %</span></div>
          <div className="flex"><span className="text-gray-500 w-24">Image:</span> <span className="font-mono text-gray-900">526 MB</span></div>
          <div className="flex"><span className="text-gray-500 w-24">MEM:</span> <span className="font-mono text-gray-900">1.2 GB</span></div>
          <div className="flex"><span className="text-gray-500 w-24">Container ID:</span> <span className="font-mono text-gray-500">kdfgo34uesdfn2</span></div>
        </div>
        
        {/* Nút này có thể giữ hoặc ẩn tùy ý, tạm thời tôi vẫn giữ cho đồng bộ */}
        <Button variant="outline" size="sm">Add Custom Domain</Button>
      </div>

      {/* 3. KHUNG CHUNG: Bao bọc thanh Tab và Nội dung của Tab */}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        {/* Thanh tiêu đề của các Tab */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-2 pt-2">
          <button 
            onClick={() => setActiveTab('deploy')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'deploy' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <FiActivity /> Deploy Histories
          </button>
          <button 
            onClick={() => setActiveTab('env')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'env' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <FiDatabase /> Environment Variables (ENV)
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <FiTerminal /> Terminal Logs
          </button>
        </div>

        {/* Nội dung bên trong khung */}
        <div className="bg-white">
          {activeTab === 'deploy' && <TabDeployHistory />}
          {activeTab === 'env' && <TabEnvironmentVariables isAdmin={isAdmin} />}
          {activeTab === 'logs' && <TabTerminalLogs />}
        </div>
      </div>

      {/* 4 & 5. Chart và Danger Zone - Ẩn hoàn toàn nếu đang ở chế độ Admin */}
      {!isAdmin && (
        <>
          {/* 4. Chart: Image Size History NẰM ĐỘC LẬP BÊN NGOÀI KHUNG TAB */}
          <div className="bg-white p-6 rounded-xl border border-orange-200 shadow-sm">
            <h3 className="text-sm font-bold text-orange-600 mb-6">Image Size History</h3>
            
            {/* TODO 4: Gỡ bỏ thẻ SVG tĩnh này. Cài đặt và sử dụng thư viện Recharts hoặc Chart.js để tự động render biểu đồ. */}
            <div className="h-64 w-full relative flex items-end">
              {/* Trục Y */}
              <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 font-mono text-right pr-2 border-r border-gray-800">
                <span>700 MB</span>
                <span>400 MB</span>
                <span>0</span>
              </div>
              {/* Trục X */}
              <div className="absolute left-12 right-0 bottom-8 border-t border-gray-800"></div>
              <div className="absolute left-12 right-0 bottom-0 h-8 flex justify-between items-center text-xs text-gray-500 px-4">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span className="text-right">Successful<br/>Deploys Times</span>
              </div>
              {/* Biểu đồ SVG */}
              <svg className="absolute left-12 right-0 top-0 bottom-8 w-[calc(100%-3rem)] h-full" preserveAspectRatio="none">
                <polyline points="0,150 100,50 250,80 400,70 550,90" fill="none" stroke="#4f46e5" strokeWidth="2" />
                <circle cx="100" cy="50" r="4" fill="#4f46e5" />
                <foreignObject x="110" y="20" width="120" height="60">
                  <div className="bg-white border border-gray-200 shadow-md p-2 rounded text-[10px] text-gray-600 leading-tight">
                    <div className="font-mono">Commit: a1b2c3d4</div>
                    <div>Size: 512MB</div>
                    <div>Date: 12/05/2026</div>
                  </div>
                </foreignObject>
              </svg>
            </div>
          </div>

          {/* 5. Danger Zone: Delete Project NẰM ĐỘC LẬP BÊN DƯỚI CÙNG */}
          <div className="bg-red-50 p-6 rounded-xl border border-red-200 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-red-800">Delete Project</h3>
              <p className="text-xs text-red-600 mt-1 max-w-md">
                Project must be in <strong>stop status</strong>. Send email to confirm and developer need to approve.
              </p>
            </div>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100 hover:border-red-400">
              Delete
            </Button>
          </div>
        </>
      )}
    </div>
  );
};