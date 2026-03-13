import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/apiConfig';
import ResidentForm from '@/components/ResidentForm';

export default function BusinessEstablishments() {
  const { token, user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('businessActiveTab');
    return savedTab || 'list';
  });
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('businessSearchQuery') || '');
  const [selectedBusiness, setSelectedBusiness] = useState(() => {
    const saved = localStorage.getItem('businessSelectedBusiness');
    return saved ? JSON.parse(saved) : null;
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [pagination, setPagination] = useState(() => {
    const savedPage = localStorage.getItem('businessCurrentPage');
    return {
      currentPage: savedPage ? parseInt(savedPage, 10) : 1,
      pageSize: 10,
      total: 0,
      pages: 1,
    };
  });

  // Persist activeTab to localStorage
  useEffect(() => {
    localStorage.setItem('businessActiveTab', activeTab);
  }, [activeTab]);

  // Persist selectedBusiness to localStorage
  useEffect(() => {
    if (selectedBusiness) {
      localStorage.setItem('businessSelectedBusiness', JSON.stringify(selectedBusiness));
    } else {
      localStorage.removeItem('businessSelectedBusiness');
    }
  }, [selectedBusiness]);

  // Persist searchQuery to localStorage
  useEffect(() => {
    localStorage.setItem('businessSearchQuery', searchQuery);
  }, [searchQuery]);

  // Persist currentPage to localStorage
  useEffect(() => {
    localStorage.setItem('businessCurrentPage', pagination.currentPage.toString());
  }, [pagination.currentPage]);

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

  useEffect(() => {
    fetchBusinesses();
  }, [pagination.currentPage, pagination.pageSize, searchQuery]);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${apiUrl}/residents/businesses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch business establishments');
      }

      const data = await response.json();
      setBusinesses(data.data || []);
      const totalPages = data.pagination?.pages || 1;
      setPagination(prev => {
        const validPage = Math.max(1, Math.min(prev.currentPage, totalPages));
        return {
          ...prev,
          currentPage: validPage,
          total: data.pagination?.total || 0,
          pages: totalPages,
        };
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(newPage, prev.pages)),
    }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination(prev => ({
      ...prev,
      currentPage: 1,
      pageSize: parseInt(newSize),
    }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: 1,
        limit: 10000, // Get all records
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`${apiUrl}/residents/businesses?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch data for export');

      const data = await response.json();
      const businesses = data.data || [];

      if (businesses.length === 0) {
        alert('No data to export');
        return;
      }

      // Format data for Excel with specified column order
      const exportData = businesses.map((b) => ({
        'Business Address': b.business_address || (b.household_number && b.address ? `${b.household_number} ${b.address} Street` : b.address ? `${b.address} Street` : b.household_number || ''),
        'Name of Business': b.business_name || '',
        'Name of Owner': `${b.last_name}, ${b.first_name}${b.middle_name ? ` ${b.middle_name}` : ''}`,
        'Age': b.age || '',
        'Civil Status': b.civil_status || '',
        'Nature of Business': b.business_type || '',
        'Contact Number': b.business_phone || b.contact_number || '',
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Business Establishments');

      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length)) + 2
      }));
      ws['!cols'] = colWidths;

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filterSuffix = searchQuery ? '_filtered' : '_all';
      const filename = `business_establishments${filterSuffix}_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Get display address (business_address if not empty, otherwise regular address)
  const getDisplayAddress = (business) => {
    if (business.business_address && business.business_address.trim()) {
      return business.business_address;
    }
    if (business.household_number && business.address) {
      return `${business.household_number} ${business.address} Street`;
    }
    return business.address ? `${business.address} Street` : business.household_number || '-';
  };

  // Get display contact (business_phone if not empty, otherwise contact_number)
  const getDisplayContact = (business) => {
    if (business.business_phone && business.business_phone.trim()) {
      return business.business_phone;
    }
    return business.contact_number || '-';
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    setActiveTab('edit');
  };

  const handleBackToList = () => {
    setActiveTab('list');
    setSelectedBusiness(null);
  };

  const handleEditSubmit = async (formData) => {
    setIsSubmitting(true);
    setError('');
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/residents/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update business');
      }

      setSuccessMessage('Business updated successfully!');
      setShowSuccessPopup(true);
      // Stay on edit form, update selectedBusiness with new data
      setSelectedBusiness({ ...formData, id: formData.id });
      fetchBusinesses();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (businessId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/residents/${businessId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete business');
      }

      setDeleteConfirm(null);
      fetchBusinesses();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading && businesses.length === 0 && activeTab === 'list') {
    return <div className="text-center py-4">Loading business establishments...</div>;
  }

  return (
    <div className="space-y-6">
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

      <h2 className="text-xl font-semibold text-gray-900">Business Establishments</h2>

      {/* Error Message */}
      {error && (
        <div className="message-error">
          {error}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <>
          {/* Search */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex gap-4 items-center flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Search by business name, owner, type, or address..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-input w-full"
                />
              </div>
              {searchQuery && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                    localStorage.removeItem('businessSearchQuery');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Business List */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Businesses ({pagination.total})</CardTitle>
            </CardHeader>
            <CardContent>
              {businesses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No business establishments found.
                  {searchQuery && ' Try a different search term.'}
                </div>
              ) : (
                <>
                  <div className="table-container">
                    <table className="w-full text-sm">
                      <thead className="table-header border-b">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Business Address</th>
                          <th className="px-4 py-2 text-left font-semibold">Name of Business</th>
                          <th className="px-4 py-2 text-left font-semibold">Name of Owner</th>
                          <th className="px-4 py-2 text-left font-semibold">Age</th>
                          <th className="px-4 py-2 text-left font-semibold">Civil Status</th>
                          <th className="px-4 py-2 text-left font-semibold">Nature of Business</th>
                          <th className="px-4 py-2 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {businesses.map((business) => (
                          <tr key={business.id} className="border-b table-row-hover">
                            <td className="px-4 py-2">{getDisplayAddress(business)}</td>
                            <td className="px-4 py-2 font-medium">
                              {business.business_name || '-'}
                            </td>
                            <td className="px-4 py-2">
                              {business.last_name}, {business.first_name}
                              {business.middle_name ? `, ${business.middle_name}` : ''}
                            </td>
                            <td className="px-4 py-2">{business.age || '-'}</td>
                            <td className="px-4 py-2">{business.civil_status || '-'}</td>
                            <td className="px-4 py-2">{business.business_type || '-'}</td>
                            <td className="px-4 py-2 space-x-2">
                              <button onClick={() => handleEdit(business)} className="text-blue-600 hover:text-blue-800 text-sm">
                                Edit
                              </button>
                              {isAdmin && (
                                <button onClick={() => setDeleteConfirm(business.id)} className="text-red-600 hover:text-red-800 text-sm">
                                  Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="pagination">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Page Size:</span>
                      <select
                        value={pagination.pageSize}
                        onChange={(e) => handlePageSizeChange(e.target.value)}
                        className="form-select w-auto"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>

                    <div className="pagination-info">
                      Page {pagination.currentPage} of {pagination.pages} ({pagination.total} total)
                    </div>

                    <div className="pagination-buttons">
                      <Button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage >= pagination.pages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </div>

                  {/* Export Button */}
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={exportToExcel}
                      disabled={isExporting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isExporting ? 'Exporting...' : `Export to Excel (${pagination.total} records)`}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit View */}
      {activeTab === 'edit' && selectedBusiness && (
        <>
          <div className="flex gap-2 mb-6">
            <Button
              onClick={handleBackToList}
              variant="outline"
            >
              ← Back to Business List
            </Button>
          </div>
          <ResidentForm
            resident={selectedBusiness}
            onSubmit={handleEditSubmit}
            isLoading={isSubmitting}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this business? This will also remove the business owner's record.</p>
            <div className="flex gap-2 justify-end">
              <Button onClick={() => setDeleteConfirm(null)} variant="outline">Cancel</Button>
              <Button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
