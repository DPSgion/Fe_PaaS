// src/components/layout/Header.tsx
import { FiSearch } from 'react-icons/fi';
import { NotificationDropdown } from '../../features/notification/components/NotificationDropdown';
import { ProfileDropdown } from '../ui/ProfileDropdown';

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Bên trái: Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">PaaS <span className="text-gray-400 font-medium text-sm">Platform</span></h1>
      </div>

      {/* Ở giữa: Thanh tìm kiếm nhanh (Nâng cấp hợp lý hơn wireframe) */}
      <div className="relative w-96">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search projects, clusters, users..."
          className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition"
        />
      </div>

      {/* Bên phải: Actions & Profile */}
      <div className="flex items-center gap-5">
        <NotificationDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
};