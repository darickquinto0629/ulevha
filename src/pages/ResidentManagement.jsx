import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { getApiUrl } from '@/lib/apiConfig';
import ResidentForm from '@/components/ResidentForm';
import ResidentList from '@/components/ResidentList';

export default function ResidentManagement() {
  const location = useLocation();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', 'edit'
  const [selectedResident, setSelectedResident] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // Determine dashboard path based on current URL
  const isAdminRoute = location.pathname.startsWith('/admin');
  const dashboardPath = isAdminRoute ? '/admin/dashboard' : '/staff/dashboard';

  const handleAddClick = () => {
    setSelectedResident(null);
    setActiveTab('add');
  };

  const handleEditClick = (resident) => {
    setSelectedResident(resident);
    setActiveTab('edit');
  };

  const triggerListRefresh = useCallback(() => {
    setListRefreshKey(prev => prev + 1);
  }, []);

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const apiUrl = getApiUrl();
      const isEditing = selectedResident?.id;
      const endpoint = isEditing
        ? `${apiUrl}/residents/${selectedResident.id}`
        : `${apiUrl}/residents`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save resident');
      }

      setMessage(`Resident ${isEditing ? 'updated' : 'added'} successfully!`);
      setActiveTab('list');
      setSelectedResident(null);
      
      // Trigger refresh
      triggerListRefresh();

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="space-y-4">
      {/* Page Title with Back Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link
            to={dashboardPath}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold text-gray-900">Resident Management</h2>
        </div>
        {activeTab === 'list' && (
          <Button
            onClick={handleAddClick}
            className="bg-green-600 hover:bg-green-700"
          >
            + Add New Resident
          </Button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`px-4 py-3 rounded-md border ${
          message.startsWith('Error')
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-green-50 border-green-200 text-green-800'
        }`}>
          {message}
        </div>
      )}

      {/* Search Bar (only on list tab) */}
      {activeTab === 'list' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <input
            type="text"
            placeholder="Search by name, household #, resident ID, or contact..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'list' && (
        <ResidentList
          key={listRefreshKey}
          onEdit={handleEditClick}
          searchQuery={searchQuery}
        />
      )}

      {(activeTab === 'add' || activeTab === 'edit') && (
        <>
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => {
                setActiveTab('list');
                setSelectedResident(null);
              }}
              variant="outline"
            >
              ← Back to Residents List
            </Button>
          </div>
          <ResidentForm
            resident={selectedResident}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
          />
        </>
      )}
    </div>
  );
}
