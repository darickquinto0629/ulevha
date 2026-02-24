import React, { useState, useCallback, useEffect } from 'react';
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
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('residentSearchQuery') || '');
  const [ageFilter, setAgeFilter] = useState(() => localStorage.getItem('residentAgeFilter') || '');
  const [genderFilter, setGenderFilter] = useState(() => localStorage.getItem('residentGenderFilter') || '');
  const [streetFilter, setStreetFilter] = useState(() => localStorage.getItem('residentStreetFilter') || '');
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-close success popup after 3 seconds
  useEffect(() => {
    if (showSuccessPopup) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup]);

  // Persist filters to localStorage
  useEffect(() => {
    localStorage.setItem('residentSearchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('residentAgeFilter', ageFilter);
  }, [ageFilter]);

  useEffect(() => {
    localStorage.setItem('residentGenderFilter', genderFilter);
  }, [genderFilter]);

  useEffect(() => {
    localStorage.setItem('residentStreetFilter', streetFilter);
  }, [streetFilter]);

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
        throw new Error(errorData.error || errorData.message || 'Failed to save resident');
      }

      const responseData = await response.json();

      setMessage(`Resident ${isEditing ? 'updated' : 'added'} successfully!`);
      setSuccessMessage(`Resident ${isEditing ? 'updated' : 'added'} successfully!`);
      setShowSuccessPopup(true);
      
      if (isEditing) {
        // Stay on edit form when updating
        triggerListRefresh();
      } else {
        // Switch to edit mode with the newly created resident
        const newResident = responseData.data || responseData;
        setSelectedResident({ ...formData, id: newResident.id });
        setActiveTab('edit');
        triggerListRefresh();
      }

      // Clear inline message after 3 seconds
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
    <div className="page-section">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-700">Saving...</p>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div 
          className="fixed inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-50 cursor-pointer"
          onClick={() => { setShowSuccessPopup(false); setSuccessMessage(''); }}
        >
          <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Page Title with Back Button */}
      <div className="page-header">
        <div>
          <Link to={dashboardPath} className="back-link">← Back to Dashboard</Link>
          <h2 className="page-title">Resident Management</h2>
        </div>
        {activeTab === 'list' && (
          <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
            + Add New Resident
          </Button>
        )}
      </div>

      {/* Error Message */}
      {message && message.startsWith('Error') && (
        <div className="message-error">
          {message}
        </div>
      )}

      {/* Search Bar and Filters (only on list tab) */}
      {activeTab === 'list' && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by name, household #, resident ID, or contact..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Age Group:</label>
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="form-select w-auto min-w-[120px]"
              >
                <option value="">All Ages</option>
                <option value="0-17">0-17</option>
                <option value="18-30">18-30</option>
                <option value="31-45">31-45</option>
                <option value="46-59">46-59</option>
                <option value="60+">60+</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Gender:</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="form-select w-auto min-w-[100px]"
              >
                <option value="">All</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Street:</label>
              <select
                value={streetFilter}
                onChange={(e) => setStreetFilter(e.target.value)}
                className="form-select w-auto min-w-[120px]"
              >
                <option value="">All Streets</option>
                <option value="Diamond">Diamond</option>
                <option value="Ruby">Ruby</option>
                <option value="Pearl">Pearl</option>
                <option value="Topaz">Topaz</option>
                <option value="Turmaline">Turmaline</option>
                <option value="Sapphire">Sapphire</option>
                <option value="Emerald">Emerald</option>
                <option value="Amethyst">Amethyst</option>
                <option value="Jade">Jade</option>
                <option value="Opal">Opal</option>
                <option value="Quartz">Quartz</option>
              </select>
            </div>
            {(searchQuery || ageFilter || genderFilter || streetFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setAgeFilter('');
                  setGenderFilter('');
                  setStreetFilter('');
                  localStorage.removeItem('residentSearchQuery');
                  localStorage.removeItem('residentAgeFilter');
                  localStorage.removeItem('residentGenderFilter');
                  localStorage.removeItem('residentStreetFilter');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === 'list' && (
        <ResidentList
          key={listRefreshKey}
          onEdit={handleEditClick}
          searchQuery={searchQuery}
          ageFilter={ageFilter}
          genderFilter={genderFilter}
          streetFilter={streetFilter}
          isAdmin={user?.role === 'admin'}
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
            key={formResetKey}
            resident={selectedResident}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting}
            onAddNew={() => {
              setSelectedResident(null);
              setActiveTab('add');
              setFormResetKey(prev => prev + 1);
            }}
          />
        </>
      )}
    </div>
  );
}
