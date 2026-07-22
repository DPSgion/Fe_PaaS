import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { PublicRoute } from '../components/layout/PublicRoute';
import { Login } from '../features/auth/Login';
import { GithubCallback } from '../features/profile/GithubCallback';

import { UserProfile } from '../features/profile/UserProfile';

import { DevDashboard } from '../features/developer/DevDashboard';
import { MyProjects } from '../features/developer/MyProjects';
import { DevProjectDetail } from '../features/developer/DevProjectDetail';

import { SystemOverview } from '../features/admin/SystemOverview';
import { UsersManagement } from '../features/admin/UsersManagement';
import { AuditLogManagement } from '../features/admin/AuditLogs';
import { AllProjects } from '../features/admin/AllProjects';
import { CreateProject } from '../features/developer/CreateProject';
import { NotificationList } from '../features/notification/NotificationList';
import { SystemSettings } from '../features/SystemAdmin/SystemSettings';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* ========================================================= */}
        {/* Public Routes */}
        {/* ========================================================= */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ========================================================= */}
        {/* Signed-in Routes */}
        {/* ========================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Personal Space Routes */}
            <Route path="/" element={<DevDashboard />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/projects/new" element={<CreateProject />} />
            <Route path="/project/:projectId/env/:envId" element={<DevProjectDetail />} />
            <Route path="/notifications" element={<NotificationList />} />

            {/* Profile */}
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/github/callback" element={<GithubCallback />} />

            {/* Admin Routes */}
            <Route path="/admin/overview" element={<SystemOverview />} />
            <Route path="/admin/users-management" element={<UsersManagement />} />
            <Route path="/admin/all-projects" element={<AllProjects />} />
            <Route path="/admin/audit-logs" element={<AuditLogManagement />} />
            
            <Route path="/admin/projects/:projectId" element={<DevProjectDetail mode="admin" />} />

            <Route path="/admin/settings" element={<SystemSettings />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
};