// src/features/admin/UserManagement.tsx
import { useState } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';

// ============================================================================
// MOCK DATA & TYPES
// ============================================================================
type Role = 'SYSTEM_ADMIN' | 'ADMIN' | 'DEVELOPER';
type Status = 'Active' | 'Banned';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  runningProjects: number;
  totalProjects: number;
  status: Status;
}

const mockUsers: User[] = [
  { id: 'u1', username: 'phuong', fullName: 'Phuong Nguyen', role: 'SYSTEM_ADMIN', runningProjects: 2, totalProjects: 3, status: 'Active' },
  { id: 'u2', username: 'khoa', fullName: 'Khoa Tran', role: 'ADMIN', runningProjects: 1, totalProjects: 1, status: 'Active' },
  { id: 'u3', username: 'dev_01', fullName: 'Nguyen Van A', role: 'DEVELOPER', runningProjects: 0, totalProjects: 2, status: 'Banned' },
  { id: 'u4', username: 'dev_02', fullName: 'Le Thi B', role: 'DEVELOPER', runningProjects: 3, totalProjects: 3, status: 'Active' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export const UsersManagement = () => {
  const [currentUserRole] = useState<Role>('SYSTEM_ADMIN'); 

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const pageSize = 10;

  // ==========================================================================
  // LOGIC & HANDLERS
  // ==========================================================================
  const canBanUser = (targetRole: Role) => {
    if (currentUserRole === 'SYSTEM_ADMIN') return targetRole !== 'SYSTEM_ADMIN';
    if (currentUserRole === 'ADMIN') return targetRole === 'DEVELOPER';
    return false;
  };

  const canEditRole = (targetRole: Role) => {
    return currentUserRole === 'SYSTEM_ADMIN' && targetRole !== 'SYSTEM_ADMIN';
  };

  const handleOpenAddModal = () => {
    setNewPassword('');
    setIsAddModalOpen(true);
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      {/* 1. Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Input username..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          
          <select className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer">
            <option value="ALL">Filter: ALL</option>
            <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEVELOPER">DEVELOPER</option>
          </select>

          <Button variant="primary" onClick={handleOpenAddModal} className="whitespace-nowrap cursor-pointer">
            <FiPlus className="mr-1" /> ADD USER
          </Button>
        </div>
      </div>

      {/* 2. User Table & Pagination Wrapper */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">USERNAME</th>
                <th className="px-6 py-4">FULL NAME</th>
                <th className="px-6 py-4">ROLE</th>
                <th className="px-6 py-4">PROJECTS</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4">{user.fullName}</td>
                  <td className="px-6 py-4">
                    <span className={`font-mono text-xs px-2.5 py-1 rounded-md border ${
                      user.role === 'SYSTEM_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-sm">
                      <span className="text-green-600 font-bold">{user.runningProjects}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600">{user.totalProjects}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className={user.status === 'Active' ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                        {user.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      {canBanUser(user.role) ? (
                        <button className={`cursor-pointer flex items-center gap-1 font-semibold uppercase text-xs ${user.status === 'Active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}>
                          {user.status === 'Active' ? <><FiLock /> BAN</> : <><FiUnlock /> UNBAN</>}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs font-semibold uppercase flex items-center gap-1 cursor-not-allowed" title="No permission">
                          <FiLock /> BAN
                        </span>
                      )}

                      {canEditRole(user.role) && (
                        <button 
                          onClick={() => setEditRoleUser(user)}
                          className="cursor-pointer flex items-center gap-1 font-semibold uppercase text-xs text-orange-500 hover:text-orange-700"
                        >
                          <FiEdit2 /> Edit Role
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm font-medium">
          <div className="text-gray-500">
            Hiển thị <span className="font-bold text-gray-700">{mockUsers.length}</span> / {pageSize} người dùng
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
              Tiếp &gt;
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODALS AREA */}
      {/* ========================================================================= */}

      {/* Modal: ADD USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-blue-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Add New User</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Username:</label>
                <input type="text" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Email:</label>
                <input type="email" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Full name:</label>
                <input type="text" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="w-24 text-sm font-medium text-gray-700">Password:</label>
                <input 
                  type="text" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập hoặc tạo tự động..." 
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-mono" 
                />
                <button 
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-indigo-700 font-bold bg-indigo-100 hover:bg-indigo-200 px-3 py-2 rounded-lg border border-indigo-300 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Auto Generate
                </button>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="w-24 text-sm font-medium text-red-600">Role:</label>
                <select className="flex-1 border border-red-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none cursor-pointer">
                  <option value="DEVELOPER">Developer</option>
                  {currentUserRole === 'SYSTEM_ADMIN' && <option value="ADMIN">Admin</option>}
                </select>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button variant="primary">Save and Mail</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: EDIT ROLE */}
      {editRoleUser && (
        <div className="fixed inset-0 bg-gray-900/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-orange-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">Edit Role</h3>
              <p className="text-xs text-gray-500 mt-1">Editing user: <strong className="text-gray-800">{editRoleUser.username}</strong></p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select new role:</label>
              <select 
                defaultValue={editRoleUser.role}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              >
                <option value="DEVELOPER">DEVELOPER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditRoleUser(null)}>Cancel</Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white cursor-pointer px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Update Role</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};