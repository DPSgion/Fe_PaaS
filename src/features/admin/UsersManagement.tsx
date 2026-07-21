import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiLock, FiUnlock, FiKey } from 'react-icons/fi';
import { Button } from '../../components/ui/Button';
import { adminApi, type AdminUser, type CreateUserPayload } from './api/adminApi';
import { EditRoleModal } from './components/EditRoleModal';
import { AddUserModal } from './components/AddUserModal';
import { StatusConfirmModal } from './components/StatusConfirmModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';

export const UsersManagement = () => {
  const loggedInUser = JSON.parse(localStorage.getItem('paas_user') || '{}');
  const [currentUserRole] = useState<string>(loggedInUser.role || 'SYSTEM_ADMIN'); 

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States cho Search (Debounce logic)
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // State cho Role Filter (Frontend local filter)
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<AdminUser | null>(null);
  const [statusUser, setStatusUser] = useState<AdminUser | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);


  // ==========================================================================
  // LOGIC DEBOUNCE SEARCH (Chờ 500ms sau khi ngừng gõ mới cập nhật từ khóa)
  // ==========================================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Bất cứ khi nào search, ép reset về trang 1
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ==========================================================================
  // API CALLS (Bắn request khi trang hoặc từ khóa bị thay đổi)
  // ==========================================================================
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Truyền thêm roleFilter vào hàm
        const data = await adminApi.getUsers(currentPage - 1, pageSize, debouncedSearch, roleFilter);
        
        setUsers(data.content);
        setTotalPages(data.totalPages === 0 ? 1 : data.totalPages); 
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, debouncedSearch, roleFilter]);

  // ==========================================================================
  // LOGIC & HANDLERS
  // ==========================================================================
  const canBanUser = (targetRole: string) => {
    if (currentUserRole === 'SYSTEM_ADMIN') return targetRole !== 'SYSTEM_ADMIN';
    if (currentUserRole === 'ADMIN') return targetRole === 'DEVELOPER';
    return false;
  };

  const canEditRole = (targetRole: string) => {
    return currentUserRole === 'SYSTEM_ADMIN' && targetRole !== 'SYSTEM_ADMIN';
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      const updatedUser = await adminApi.changeRole(userId, { role: newRole });
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      setEditRoleUser(null); // Tắt Modal
      window.alert("Cập nhật quyền thành công!");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Lỗi hệ thống.';
      window.alert(errorMessage);
    }
  };

  const handleUpdateStatus = async (userId: number, newStatus: 'ACTIVE' | 'BANNED', reason?: string) => {
    try {
      const updatedUser = await adminApi.changeStatus(userId, { status: newStatus, reason });
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      
      setStatusUser(null); // Đóng Modal
      window.alert(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Lỗi hệ thống.';
      window.alert(errorMessage);
    }
  };

  const handleAddUser = async (payload: CreateUserPayload) => {
    // Không dùng try...catch ở đây nữa. Nếu API lỗi, nó sẽ văng thẳng về AddUserModal
    const newUser = await adminApi.createUser(payload);
    
    setUsers(prev => [newUser, ...prev]);
    setTotalElements(prev => prev + 1);
    
    // Tạo thành công thì tự đóng modal
    setIsAddModalOpen(false);
    window.alert("Tạo người dùng thành công! Thông tin đăng nhập đã sẵn sàng.");
  };

  // Hàm kiểm tra xem tài khoản đang đăng nhập có quyền Reset không
  const canResetPassword = (targetRole: string) => {
    // Giống hệnh logic Backend: SYSTEM_ADMIN được thao tác mọi người trừ SYSTEM_ADMIN khác
    if (currentUserRole === 'SYSTEM_ADMIN') return targetRole !== 'SYSTEM_ADMIN';
    // ADMIN chỉ được thao tác với DEVELOPER
    if (currentUserRole === 'ADMIN') return targetRole === 'DEVELOPER';
    return false;
  };

  // Hàm xử lý gọi API Reset Password
  const handleResetPassword = async (userId: number, newPassword: string) => {
    try {
      const res = await adminApi.resetPassword(userId, { password: newPassword });
      setResetPasswordUser(null);
      // Backend trả về mật khẩu, tiện tay in ra cho Admin copy luôn
      window.alert(`Đổi mật khẩu thành công!\n\nTài khoản: ${res.username}\nMật khẩu mới: ${res.newPassword}\n\nHãy copy và gửi mật khẩu này cho người dùng.`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data || 'Lỗi hệ thống. Không thể reset mật khẩu.';
      window.alert(errorMessage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Ô Tìm kiếm đã được nối State */}
          <div className="relative flex-1 md:w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Input username, email, full name"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          
          {/* Dropdown Lọc đã được nối State */}
          <select 
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer transition-all"
          >
            <option value="ALL">Filter: ALL</option>
            <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DEVELOPER">DEVELOPER</option>
          </select>

          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="whitespace-nowrap cursor-pointer shadow-sm font-semibold">
            <FiPlus className="mr-1" /> ADD USER
          </Button>
        </div>
      </div>

      {/* 2. User Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-1">
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-3"></div>
                      <p>Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                // ĐÃ ĐỔI TỪ users.map THÀNH displayedUsers.map
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <div>{user.fullName}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
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
                        <span className="text-green-600 font-bold">{user.activeProjectCount}</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-gray-600">{user.totalProjectCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={user.status === 'ACTIVE' ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        {canBanUser(user.role) ? (
                          <button 
                            onClick={() => setStatusUser(user)}
                            className={`cursor-pointer flex items-center gap-1 font-semibold uppercase text-xs transition-colors ${user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                          >
                            {user.status === 'ACTIVE' ? <><FiLock /> BAN</> : <><FiUnlock /> UNBAN</>}
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs font-semibold uppercase flex items-center gap-1 cursor-not-allowed" title="No permission">
                            <FiLock /> BAN
                          </span>
                        )}

                        {canEditRole(user.role) && (
                          <button 
                            onClick={() => setEditRoleUser(user)}
                            className="cursor-pointer flex items-center gap-1 font-semibold uppercase text-xs text-orange-500 hover:text-orange-700 transition-colors"
                          >
                            <FiEdit2 /> Edit Role
                          </button>
                        )}

                        {canResetPassword(user.role) && (
                          <button 
                            onClick={() => setResetPasswordUser(user)}
                            className="cursor-pointer flex items-center gap-1 font-semibold uppercase text-xs text-teal-600 hover:text-teal-800 transition-colors"
                          >
                            <FiKey /> Reset Pass
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-sm font-medium">
          <div className="text-gray-500">
            Hiển thị <span className="font-bold text-gray-700">{users.length}</span> / {totalElements} người dùng
          </div>
          
          <div className="flex items-center gap-4 text-gray-600">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || isLoading}
              className={`transition-colors ${currentPage === 1 || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
            >
              &lt; Trước
            </button>
            
            <span className="bg-white border border-gray-300 px-3 py-1 rounded-md">
              Trang {currentPage} / {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || isLoading}
              className={`transition-colors ${currentPage === totalPages || isLoading ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:text-indigo-600'}`}
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
      {/* Modal: ADD USER */}
      {isAddModalOpen && (
        <AddUserModal 
          currentUserRole={currentUserRole}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddUser}
        />
      )}

      {/* Modal: EDIT ROLE */}
      {editRoleUser && (
        <EditRoleModal 
          user={editRoleUser}
          onClose={() => setEditRoleUser(null)}
          onUpdate={handleUpdateRole} 
        />
      )}

      {/* Modal: BAN / UNBAN */}
      {statusUser && (
        <StatusConfirmModal 
          user={statusUser}
          onClose={() => setStatusUser(null)}
          onConfirm={handleUpdateStatus}
        />
      )}

      {resetPasswordUser && (
        <ResetPasswordModal 
          user={resetPasswordUser}
          onClose={() => setResetPasswordUser(null)}
          onConfirm={handleResetPassword}
        />
      )}

    </div>
  );
};