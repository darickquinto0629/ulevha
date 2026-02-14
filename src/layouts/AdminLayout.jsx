import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminDashboard from '@/pages/AdminDashboard';
import ResidentManagement from '@/pages/ResidentManagement';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ULEVHA Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-red-100 text-red-800">Admin</Badge>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="residents" element={<ResidentManagement />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
