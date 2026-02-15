import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StaffDashboard from '@/pages/StaffDashboard';
import ResidentManagement from '@/pages/ResidentManagement';

const navItems = [
  { path: '/staff/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/staff/residents', icon: '👥', label: 'Resident Management' },
  { path: '/staff/add-resident', icon: '➕', label: 'Add New Resident', disabled: true },
  { path: '/staff/import', icon: '📥', label: 'Import Data', disabled: true },
];

export default function StaffLayout() {
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
          <p className="dashboard-sidebar-subtitle">Staff Portal</p>
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
          
          <p className="dashboard-sidebar-section">Quick Actions</p>
          {navItems.slice(2).map((item) => (
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

        {/* Info section at bottom */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <p className="text-xs text-gray-500 mb-2">Your Access:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✓ View residents</li>
            <li>✓ Create/Update records</li>
            <li>✓ View analytics</li>
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="text-sm text-gray-600">Welcome back, <span className="font-medium">{user?.name}</span></p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </header>

        <main className="dashboard-content">
          <Routes>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="residents" element={<ResidentManagement />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
