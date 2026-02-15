import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from '@/pages/AdminDashboard';
import ResidentManagement from '@/pages/ResidentManagement';
import UserManagement from '@/pages/UserManagement';

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/admin/residents', icon: '👨‍👩‍👧‍👦', label: 'Residents' },
  { path: '/admin/users', icon: '👥', label: 'User Management' },
  { path: '/admin/logs', icon: '📋', label: 'Audit Logs', disabled: true },
  { path: '/admin/backup', icon: '💾', label: 'Backup', disabled: true },
  { path: '/admin/staff', icon: '🔐', label: 'Staff Management', disabled: true },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h1 className="dashboard-sidebar-title">ULEVHA</h1>
          <p className="dashboard-sidebar-subtitle">Admin Portal</p>
        </div>
        <nav className="dashboard-sidebar-nav">
          <p className="dashboard-sidebar-section">Main Menu</p>
          {navItems.slice(0, 2).map((item) => (
            <div
              key={item.path}
              className={location.pathname === item.path ? 'sidebar-nav-item-active' : 'sidebar-nav-item'}
              onClick={() => !item.disabled && navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-text">{item.label}</span>
            </div>
          ))}
          
          <p className="dashboard-sidebar-section">Administration</p>
          {navItems.slice(2, 3).map((item) => (
            <div
              key={item.path}
              className={`${location.pathname === item.path ? 'sidebar-nav-item-active' : 'sidebar-nav-item'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !item.disabled && navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-text">{item.label}</span>
            </div>
          ))}
          
          <p className="dashboard-sidebar-section">System</p>
          {navItems.slice(3).map((item) => (
            <div
              key={item.path}
              className={`${location.pathname === item.path ? 'sidebar-nav-item-active' : 'sidebar-nav-item'} ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => !item.disabled && navigate(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-text">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="text-sm text-gray-600">Welcome back, <span className="font-medium">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-red-100 text-red-800">Admin</Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </header>

        <main className="dashboard-content">
          <Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="residents" element={<ResidentManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
