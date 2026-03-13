import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/apiConfig';

export default function ResidentList({ onEdit, searchQuery = '', ageFilter = '', genderFilter = '', streetFilter = '', cardTypeFilter = '', isAdmin = false }) {
  const { token } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(() => {
    const savedPage = localStorage.getItem('residentCurrentPage');
    return {
      currentPage: savedPage ? parseInt(savedPage, 10) : 1,
      pageSize: 10,
      total: 0,
      pages: 0,
    };
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Track previous filter values to detect actual changes
  const prevFiltersRef = React.useRef({
    searchQuery,
    ageFilter,
    genderFilter,
    streetFilter,
    cardTypeFilter
  });

  // Persist current page to localStorage
  useEffect(() => {
    localStorage.setItem('residentCurrentPage', pagination.currentPage.toString());
  }, [pagination.currentPage]);

  // Reset to page 1 when filters actually change (not on mount)
  useEffect(() => {
    const prev = prevFiltersRef.current;
    const filtersChanged = 
      prev.searchQuery !== searchQuery ||
      prev.ageFilter !== ageFilter ||
      prev.genderFilter !== genderFilter ||
      prev.streetFilter !== streetFilter ||
      prev.cardTypeFilter !== cardTypeFilter;
    
    // Update ref with current values
    prevFiltersRef.current = {
      searchQuery,
      ageFilter,
      genderFilter,
      streetFilter,
      cardTypeFilter
    };
    
    // Only reset page if filters actually changed
    if (filtersChanged) {
      setPagination(prev => ({ ...prev, currentPage: 1 }));
      localStorage.setItem('residentCurrentPage', '1');
    }
  }, [searchQuery, ageFilter, genderFilter, streetFilter, cardTypeFilter]);

  useEffect(() => {
    fetchResidents();
  }, [pagination.currentPage, pagination.pageSize, searchQuery, ageFilter, genderFilter, streetFilter, cardTypeFilter]);

  const fetchResidents = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

      // Add age filter if present
      if (ageFilter) {
        params.append('ageGroup', ageFilter);
      }

      // Add gender filter if present
      if (genderFilter) {
        params.append('gender', genderFilter);
      }

      // Add street filter if present
      if (streetFilter) {
        params.append('street', streetFilter);
      }

      // Add card type filter if present
      if (cardTypeFilter) {
        params.append('cardType', cardTypeFilter);
      }

      const endpoint = searchQuery
        ? `${apiUrl}/residents/search?${params}&query=${encodeURIComponent(searchQuery)}`
        : `${apiUrl}/residents?${params}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch residents');
      }

      const data = await response.json();
      setResidents(data.data || []);
      const totalPages = data.pagination?.pages || 1;
      setPagination(prev => {
        // Ensure currentPage doesn't exceed total pages
        const validPage = Math.max(1, Math.min(prev.currentPage, totalPages));
        if (validPage !== prev.currentPage) {
          localStorage.setItem('residentCurrentPage', validPage.toString());
        }
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

  const handleDelete = async (residentId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/residents/${residentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete resident');
      }

      setDeleteConfirm(null);
      fetchResidents();
    } catch (err) {
      setError(err.message);
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

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: 1,
        limit: 10000, // Get all records
      });

      if (ageFilter) params.append('ageGroup', ageFilter);
      if (genderFilter) params.append('gender', genderFilter);
      if (streetFilter) params.append('street', streetFilter);
      if (cardTypeFilter) params.append('cardType', cardTypeFilter);

      const endpoint = searchQuery
        ? `${apiUrl}/residents/search?${params}&query=${encodeURIComponent(searchQuery)}`
        : `${apiUrl}/residents?${params}`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch data for export');

      const data = await response.json();
      const residents = data.data || [];

      if (residents.length === 0) {
        alert('No data to export');
        return;
      }

      // Format data for Excel
      const exportData = residents.map((r, index) => ({
        'No.': index + 1,
        'Resident ID': r.resident_id,
        'House #': r.household_number,
        'Last Name': r.last_name,
        'First Name': r.first_name,
        'Middle Name': r.middle_name || '',
        'Gender': r.gender === 'M' ? 'Male' : 'Female',
        'Date of Birth': r.date_of_birth,
        'Age': r.age,
        'Birth Place': r.birth_place || '',
        'Address': r.address || '',
        'Contact Number': r.contact_number || '',
        'Civil Status': r.civil_status || '',
        'Religion': r.religion || '',
        'Educational Attainment': r.educational_attainment || '',
        'Card Types': r.card_types ? JSON.parse(r.card_types).join(', ') : '',
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Residents');

      // Auto-size columns
      const colWidths = Object.keys(exportData[0]).map(key => ({
        wch: Math.max(key.length, ...exportData.map(row => String(row[key]).length)) + 2
      }));
      ws['!cols'] = colWidths;

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const filterSuffix = (searchQuery || ageFilter || genderFilter || streetFilter || cardTypeFilter) ? '_filtered' : '_all';
      const filename = `residents${filterSuffix}_${date}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && residents.length === 0) {
    return <div className="text-center py-4">Loading residents...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Residents List</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="message-error mb-4">{error}</div>}

        {residents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No residents found</div>
        ) : (
          <>
            <div className="table-container">
              <table className="w-full text-sm">
                <thead className="table-header border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Address</th>
                    <th className="px-4 py-2 text-left font-semibold">Age</th>
                    <th className="px-4 py-2 text-left font-semibold">Contact</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((resident) => (
                    <tr key={resident.id} className={`border-b table-row-hover ${resident.is_head_of_family ? 'head-of-family' : ''}`}>
                      <td className="px-4 py-2">
                        {resident.last_name}, {resident.first_name}{resident.middle_name ? `, ${resident.middle_name}` : ''}
                      </td>
                      <td className="px-4 py-2">
                        {resident.household_number && resident.address 
                          ? `${resident.household_number} ${resident.address} Street` 
                          : resident.address ? `${resident.address} Street` : resident.household_number || '-'}
                      </td>
                      <td className="px-4 py-2">{resident.age}</td>
                      <td className="px-4 py-2">{resident.contact_number || '-'}</td>
                      <td className="px-4 py-2 space-x-2">
                        <button onClick={() => onEdit(resident)} className="text-blue-600 hover:text-blue-800 text-sm">
                          Edit
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteConfirm(resident.id)} className="text-red-600 hover:text-red-800 text-sm">
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
                Page {pagination.currentPage} of {pagination.pages || 1} ({pagination.total} total)
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
                  disabled={pagination.currentPage >= (pagination.pages || 1)}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Export Button - Admin Only */}
            {isAdmin && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={exportToExcel}
                  disabled={isExporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isExporting ? 'Exporting...' : `Export to Excel (${pagination.total} records)`}
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this resident?</p>
              <div className="flex gap-2 justify-end">
                <Button onClick={() => setDeleteConfirm(null)} variant="outline">Cancel</Button>
                <Button onClick={() => handleDelete(deleteConfirm)} className="bg-red-600 hover:bg-red-700">Delete</Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
