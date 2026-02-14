import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiCall } from '@/lib/apiConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await apiCall('/residents/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMaleCount = () => {
    if (!stats?.byGender) return 0;
    const male = stats.byGender.find((g) => g.gender === 'M' || g.gender?.toLowerCase() === 'male');
    return male?.count || 0;
  };

  const getFemaleCount = () => {
    if (!stats?.byGender) return 0;
    const female = stats.byGender.find((g) => g.gender === 'F' || g.gender?.toLowerCase() === 'female');
    return female?.count || 0;
  };

  const getGenderChartData = () => {
    if (!stats?.byGender) return [];
    const genderLabels = { 'M': 'Male', 'F': 'Female' };
    return stats.byGender.map((item) => ({
      name: genderLabels[item.gender] || item.gender || 'Unknown',
      value: item.count,
    }));
  };

  const getAgeChartData = () => {
    if (!stats?.byAge) return [];
    return stats.byAge;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ulevha Staff Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-blue-100 text-blue-800">Staff</Badge>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {loading ? '...' : stats?.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Registered residents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Male Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : getMaleCount()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Male population</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Female Residents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-pink-600">
                {loading ? '...' : getFemaleCount()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Female population</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Age Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Age Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading...
                  </div>
                ) : getAgeChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getAgeChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Loading...
                  </div>
                ) : getGenderChartData().length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getGenderChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getGenderChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/staff/residents')}>
            <CardHeader>
              <CardTitle className="text-lg">👥 Resident Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View, create, update, and manage resident records
              </p>
              <Button className="w-full">Manage Residents</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">➕ Add New Resident</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Add a new resident to the system
              </p>
              <Button className="w-full">New Resident</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">📥 Import Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Import resident data from CSV files
              </p>
              <Button className="w-full">Import</Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Alert */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">About Your Access</h3>
          <p className="text-blue-800 mb-3">
            As a staff member, you have access to the following features:
          </p>
          <ul className="text-blue-800 space-y-1 ml-4">
            <li>✓ View all resident records</li>
            <li>✓ Create new resident entries</li>
            <li>✓ Update resident information</li>
            <li>✓ Delete resident records</li>
            <li>✓ View demographics and analytics charts</li>
            <li>✗ Access to system settings (Admin only)</li>
            <li>✗ Manage staff accounts (Admin only)</li>
            <li>✗ View audit logs (Admin only)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
