// src/features/admin/SystemOverview.tsx
import { FiMail, FiStopCircle, FiEye } from 'react-icons/fi';

// ============================================================================
// MOCK DATA
// ============================================================================
const mockTopRamProjects = [
  { id: 1, name: 'Cupzone Backend', branch: 'main', value: '1.2 GB', username: 'Phuong' },
  { id: 2, name: 'AI English Master', branch: 'staging', value: '850 MB', username: 'Phuong' },
  { id: 3, name: 'Payment Gateway', branch: 'dev', value: '600 MB', username: 'Khoa' },
];

const mockTopStorageProjects = [
  { id: 1, name: 'Postgres DB Cluster', branch: 'main', value: '15.5 GB', username: 'System' },
  { id: 2, name: 'Redis Cache', branch: 'main', value: '4.2 GB', username: 'System' },
  { id: 3, name: 'Cupzone Backend', branch: 'main', value: '1.8 GB', username: 'Phuong' },
];

const mockSystemLogs = [
  { time: '17:05:12', event: 'System clear 10 GB GARBAGE successful.', type: 'info' },
  { time: '16:45:00', event: 'Project [AI English Master] (main) is down. Restarting...', type: 'danger' },
  { time: '15:30:22', event: 'User [Khoa] deleted project [Test-App-01].', type: 'warning' },
  { time: '15:00:00', event: 'Daily backup completed for all main branches.', type: 'info' },
];

// ============================================================================
// LOCAL COMPONENTS
// ============================================================================

interface ConsumptionTableProps {
  title: string;
  metricLabel: string;
  data: Array<{ id: number; name: string; branch: string; value: string; username: string }>;
}

const ConsumptionTable = ({ title, metricLabel, data }: ConsumptionTableProps) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
      <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-500 uppercase bg-white border-b border-gray-200">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Branch</th>
            <th className="px-6 py-3">{metricLabel}</th>
            <th className="px-6 py-3">Username</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((proj) => (
            <tr key={proj.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{proj.name}</td>
              <td className="px-6 py-4">
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200">{proj.branch}</span>
              </td>
              <td className="px-6 py-4 font-mono font-bold text-orange-600">{proj.value}</td>
              <td className="px-6 py-4">{proj.username}</td>
              <td className="px-6 py-4">
                {/* TODO: Gắn Route Link sang trang chi tiết dự án (View), gọi API gửi Mail và Docker Stop */}
                <div className="flex items-center gap-4">
                  <button className="text-indigo-600 hover:text-indigo-800" title="View Project Details">
                    <FiEye size={18} />
                  </button>
                  <button className="text-indigo-600 hover:text-indigo-800" title="Send Email">
                    <FiMail size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
                    <FiStopCircle size={18} /> Force Stop
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SystemOverview = () => {
  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8">
      {/* 1. Header Area */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Good Morning, Admin 👋</h2>
        <p className="text-gray-500 mt-1">Here's what's happening with your system today</p>
      </div>

      {/* 2. Top Metrics Grid */}
      {/* TODO: Fetch các thông số tổng quan từ API. */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Users</h3>
          <div className="text-4xl font-bold text-gray-900">7</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Projects</h3>
          <div className="text-4xl font-bold text-gray-900">
            <span className="text-indigo-600">9</span><span className="text-xl text-gray-400 mx-1">/</span><span className="text-2xl text-gray-500">13</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm md:col-span-2 flex flex-col justify-center">
          <div className="grid grid-cols-4 gap-4 text-center divide-x divide-gray-200">
            <div><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">OS</h3><div className="text-sm font-medium text-gray-900">Ubuntu LTS<br/>24.04</div></div>
            <div><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">CPU</h3><div className="text-sm font-medium text-gray-900">8 cores</div></div>
            <div><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">RAM</h3><div className="text-sm font-medium text-gray-900">16 GB</div></div>
            <div><h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">DISK</h3><div className="text-sm font-medium text-gray-900">100 GB</div></div>
          </div>
        </div>
      </div>

      {/* 3. Server Resource Chart Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Server: 8 CORES / 16 GB RAM / 100 GB STORAGE</h3>
        </div>
        <div className="p-6 flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/4 space-y-6 flex flex-col justify-center">
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Ram used</h4>
              <div className="text-xl font-bold text-gray-900">8.3 / 16 <span className="text-sm text-gray-500 font-normal">(52%)</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: '52%' }}></div></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-1">Disk used</h4>
              <div className="text-xl font-bold text-gray-900">21 / 100 <span className="text-sm text-gray-500 font-normal">(21%)</span></div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '21%' }}></div></div>
            </div>
          </div>
          <div className="w-full lg:w-3/4 relative h-48 border-l border-gray-100 pl-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-4 absolute top-0 left-6">CPU %</h4>
            {/* TODO: Gỡ SVG tĩnh này. Thay bằng thư viện biểu đồ. */}
            <div className="absolute inset-0 top-8 left-6 flex items-end">
              <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-gray-400 font-mono text-right pr-2">
                <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
              </div>
              <div className="absolute left-8 right-0 bottom-6 border-t border-gray-800"></div>
              <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-center text-[10px] text-gray-400 px-4 font-mono">
                <span>15:00</span><span>15:30</span><span>16:00</span><span>16:30</span><span>17:00</span><span>Time</span>
              </div>
              <svg className="absolute left-8 right-0 top-0 bottom-6 w-[calc(100%-2rem)] h-full" preserveAspectRatio="none">
                <polyline points="0,120 50,110 80,40 100,100 200,110 250,50 280,90 320,80 350,115 500,115 600,115" fill="none" stroke="#1f2937" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Top Consumption Tables */}
      <div className="grid grid-cols-1 gap-8">
        <ConsumptionTable 
          title="Top 5 RAM Consumption Projects" 
          metricLabel="RAM" 
          data={mockTopRamProjects} 
        />
        <ConsumptionTable 
          title="Top 5 Storage (Image + Volume) Consumption" 
          metricLabel="Storage" 
          data={mockTopStorageProjects} 
        />
      </div>

      {/* 5. System Logs */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-bold text-red-600 uppercase tracking-wide">System Logs (Latest Events)</h3>
        </div>
        {/* TODO: Fetch System Logs. API cần filter trong ngày và LIMIT max 100 dòng mới nhất để tránh đơ UI. */}
        <div className="overflow-y-auto h-[350px]">
          <table className="w-full text-sm text-left font-mono">
            <tbody>
              {[
                { time: '17:05:12', event: 'System clear 10 GB GARBAGE successful.', type: 'info' },
                { time: '16:45:00', event: 'Project [AI English Master] (main) is down. Restarting...', type: 'danger' },
                { time: '15:30:22', event: 'User [Khoa] deleted project [Test-App-01].', type: 'warning' },
                { time: '15:00:00', event: 'Daily backup completed for all main branches.', type: 'info' },
                { time: '14:12:05', event: 'Node worker-02 CPU spike detected (98%).', type: 'danger' },
                { time: '13:45:11', event: 'Database connection pool maxed out.', type: 'warning' },
                { time: '12:00:00', event: 'SSL Certificate auto-renewed for *.paas.com', type: 'info' },
                { time: '11:20:05', event: 'Container registry cache cleared.', type: 'info' },
                { time: '10:05:33', event: 'Project [Cupzone Backend] deployed successfully.', type: 'info' },
                { time: '09:15:00', event: 'System booted up gracefully.', type: 'info' },
              ].map((log, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                  <td className="px-6 py-3 w-32 text-gray-500 whitespace-nowrap align-top">{log.time}</td>
                  <td className={`px-6 py-3 ${
                    log.type === 'danger' ? 'text-red-600 font-medium' : 
                    log.type === 'warning' ? 'text-yellow-600' : 
                    log.type === 'info' ? 'text-indigo-600' : 'text-gray-800'
                  }`}>
                    {log.event}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};