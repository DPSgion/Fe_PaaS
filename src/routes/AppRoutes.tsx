import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';

import { DevDashboard } from '../features/developer/DevDashboard';
import { MyProjects } from '../features/developer/MyProjects';
import { DevProjectDetail } from '../features/developer/DevProjectDetail';

import { SystemOverview } from '../features/admin/SystemOverview';
import { UsersManagement } from '../features/admin/UsersManagement';
// Mock Pages
const AllProjects = () => <div>All Projects Content</div>;
const AuditLogs = () => <div>Audit Logs Content</div>;

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Personal Space Routes */}
          <Route path="/" element={<DevDashboard />} />
          <Route path="/my-projects" element={<MyProjects />} />
          
          {/* Đường dẫn động này bắt buộc phải giữ nguyên để trang chi tiết chạy được */}
          <Route path="/project/:projectId/env/:envId" element={<DevProjectDetail />} />
          
          {/* Admin Routes (Đã cập nhật theo Sidebar mới của bạn) */}
          <Route path="/admin/overview" element={<SystemOverview />} />
          <Route path="/admin/users-management" element={<UsersManagement />} />
          <Route path="/admin/all-projects" element={<AllProjects />} />
          <Route path="/admin/audit-logs" element={<AuditLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};