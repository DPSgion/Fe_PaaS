// src/features/admin/AuditLogs.tsx
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// ============================================================================
// MOCK DATA & TYPES
// ============================================================================
type ActionType = 'BAN_USER' | 'DELETE_PROJECT' | 'STOP_CONTAINER' | 'UPDATE_ENV' | 'CREATE_ADMIN' | 'EDIT_ROLE';

interface AuditLog {
    id: string;
    timestamp: string;
    actor: string;
    actionType: ActionType;
    target: {
        type: 'project' | 'user' | 'system';
        id: string;
        name: string;
        branch?: string; // Chỉ dùng cho project
    };
    description: string;
}

const mockLogs: AuditLog[] = [
    {
        id: 'log1',
        timestamp: '2026-06-16 10:45:12',
        actor: 'phuong (SYSTEM_ADMIN)',
        actionType: 'STOP_CONTAINER',
        target: { type: 'project', id: 'proj_1', name: 'Cupzone Backend', branch: 'main' },
        description: 'Force stopped container due to high CPU usage.',
    },
    {
        id: 'log2',
        timestamp: '2026-06-16 09:12:00',
        actor: 'khoa (ADMIN)',
        actionType: 'BAN_USER',
        target: { type: 'user', id: 'u3', name: 'dev_01' },
        description: 'Banned user for violating resource limits.',
    },
    {
        id: 'log3',
        timestamp: '2026-06-15 16:30:22',
        actor: 'phuong (SYSTEM_ADMIN)',
        actionType: 'EDIT_ROLE',
        target: { type: 'user', id: 'u2', name: 'khoa' },
        description: 'Changed role from DEVELOPER to ADMIN.',
    },
    {
        id: 'log4',
        timestamp: '2026-06-15 14:00:05',
        actor: 'Sinh vien (DEVELOPER)',
        actionType: 'DELETE_PROJECT',
        target: { type: 'project', id: 'proj_2', name: 'Test-App-01', branch: 'dev' },
        description: 'Deleted project due to inactivity.',
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const AuditLogs = () => {
    // TODO 1: Gắn API fetch danh sách Audit Logs. 
    // Cần bắt sự kiện onChange của các bộ lọc (User, Action Type, Date Range) và truyền tham số lên API cùng với currentPage để phân trang thực tế.
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 5; // TODO: Lấy totalPages từ API trả về
    const pageSize = 10;

    const formatActionType = (action: ActionType) => {
        return action.replace('_', ' ');
    };

    return (
        <div className="max-w-7xl mx-auto pb-12 space-y-6">
            {/* 1. Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                <p className="text-sm text-gray-500 mt-1">Truy vết chi tiết các thao tác trên hệ thống.</p>
            </div>

            {/* 2. Filters */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-5 items-end">
                {/* User Search */}
                <div className="w-full lg:w-1/3">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">User</label>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find by name, email, username..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                {/* Action Type */}
                <div className="w-full lg:w-1/4">
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Action Type</label>
                    <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer">
                        <option value="ALL">ALL</option>
                        <option value="BAN_USER">Ban user</option>
                        <option value="DELETE_PROJECT">Delete project</option>
                        <option value="STOP_CONTAINER">Stop container</option>
                        <option value="UPDATE_ENV">Update env</option>
                        <option value="CREATE_ADMIN">Create admin</option>
                        <option value="EDIT_ROLE">Edit role</option>
                    </select>
                </div>

                {/* Date Range */}
                <div className="w-full lg:w-[40%] flex gap-3 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">From Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        />
                    </div>
                    <span className="mb-2 text-gray-400 font-medium">-</span>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">To Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Action Type</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLogs.map((log) => (
                                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{log.actor}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-md text-xs font-semibold uppercase">
                                            {formatActionType(log.actionType)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Phân loại render Target */}
                                        {log.target.type === 'project' ? (
                                            // TODO 2: Đảm bảo route "/admin/projects/:projectId" khớp với định tuyến thực tế của trang Admin_ShowProjectsDetail trong AppRoutes
                                            <Link to={`/admin/projects/${log.target.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium flex flex-col w-fit">
                                                <span className="hover:underline">{log.target.name}</span>
                                                <span className="text-xs text-gray-500 font-mono no-underline">({log.target.branch})</span>
                                            </Link>
                                        ) : (
                                            <span className="text-gray-700 font-medium">User: {log.target.name}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{log.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm font-medium">
                    <div className="text-gray-500">
                        Hiển thị <span className="font-bold text-gray-700">{mockLogs.length}</span> / {pageSize} bản ghi
                    </div>

                    <div className="flex items-center gap-4 text-gray-600">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`transition-colors ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
                        >
                            &lt; Trước
                        </button>
                        <span className="bg-white border border-gray-300 px-3 py-1 rounded-md">
                            Trang {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`transition-colors ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
                        >
                            Sau &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};