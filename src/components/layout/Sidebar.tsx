import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiDatabase, FiServer, FiUsers, FiLayers, FiList, FiBell, FiSettings } from 'react-icons/fi';
import { useEffect, useState } from 'react';

const navItems = [
  { 
    group: "Personal Space", 
    items: [
      { name: "Dashboard", path: "/", icon: FiGrid },
      { name: "My Projects", path: "/my-projects", icon: FiDatabase },
      { name: "Notifications", path: "/notifications", icon: FiBell },
    ]
  },
  { 
    group: "System Admin", 
    items: [
      { name: "System Overview", path: "/admin/overview", icon: FiServer },
      { name: "User Management", path: "/admin/users-management", icon: FiUsers },
      { name: "All Projects", path: "/admin/all-projects", icon: FiLayers },
      { name: "Audit Logs", path: "/admin/audit-logs", icon: FiList },
    ]
  }
];

export const Sidebar = () => {
  const { pathname } = useLocation();
  // SỬA GẮT: Tách làm 2 state phân quyền rõ ràng
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);

  useEffect(() => {
    try {
        const userStr = localStorage.getItem('paas_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            // 1. Cả ADMIN và SYSTEM_ADMIN đều được thấy cụm menu quản lý chung
            setIsAdmin(user.role === 'ADMIN' || user.role === 'SYSTEM_ADMIN');
            // 2. CHỈ SYSTEM_ADMIN mới được thấy nút cấu hình đáy
            setIsSystemAdmin(user.role === 'SYSTEM_ADMIN');
        }
    } catch (e) {
        console.error("Lỗi parse thông tin user:", e);
    }
  }, []);

  const visibleGroups = navItems.filter(group => {
      // Dùng biến isAdmin cho cụm menu
      if (group.group === "System Admin" && !isAdmin) return false;
      return true;
  });

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-[calc(100vh-64px)]">
      
      {/* Khu vực danh sách menu */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-y-8">
        {visibleGroups.map((group, index) => (
          <div key={index}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
              {group.group}
            </h4>
            <ul className="space-y-1">
              {group.items.map(item => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                    >
                      <Icon size={18} className={`${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Khu vực Settings dính đáy - SỬA GẮT: Chỉ dùng biến isSystemAdmin ở đây */}
      {isSystemAdmin && (
        <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <Link
            to="/admin/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
              pathname === '/admin/settings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiSettings size={18} className={pathname === '/admin/settings' ? 'text-white' : 'text-gray-500'} />
            System Settings
          </Link>
        </div>
      )}
    </aside>
  );
};