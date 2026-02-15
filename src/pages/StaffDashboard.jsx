import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const { token } = useAuth();
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
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
      
      {/* Statistics Cards - Compact Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card-compact">
          <p className="stat-title">Total Residents</p>
          <p className="stat-value">{loading ? '...' : stats?.total || 0}</p>
        </div>
        <div className="stat-card-compact">
          <p className="stat-title">Male</p>
          <p className="stat-value-blue">{loading ? '...' : getMaleCount()}</p>
        </div>
        <div className="stat-card-compact">
          <p className="stat-title">Female</p>
          <p className="stat-value-pink">{loading ? '...' : getFemaleCount()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2-cols">
        {/* Age Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {loading ? (
                <div className="chart-placeholder">Loading...</div>
              ) : getAgeChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getAgeChartData()} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="chart-placeholder">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gender Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {loading ? (
                <div className="chart-placeholder">Loading...</div>
              ) : getGenderChartData().length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getGenderChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
                <div className="chart-placeholder">No data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
