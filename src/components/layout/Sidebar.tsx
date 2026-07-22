// src/components/layout/Sidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiDatabase, FiServer, FiUsers, FiLayers, FiList, FiBell } from 'react-icons/fi';

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

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex flex-col gap-y-8 h-[calc(100vh-64px)] overflow-y-auto">
      {navItems.map((group, index) => (
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
    </aside>
  );
};