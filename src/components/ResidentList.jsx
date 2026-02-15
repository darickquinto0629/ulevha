import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/apiConfig';

export default function ResidentList({ onEdit, searchQuery = '', isAdmin = false }) {
  const { token } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchResidents();
  }, [pagination.currentPage, pagination.pageSize, searchQuery]);

  const fetchResidents = async () => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = getApiUrl();
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

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
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        pages: data.pagination?.pages || 0,
      }));
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
                    <th className="px-4 py-2 text-left font-semibold">Household #</th>
                    <th className="px-4 py-2 text-left font-semibold">Age</th>
                    <th className="px-4 py-2 text-left font-semibold">Contact</th>
                    <th className="px-4 py-2 text-left font-semibold">Civil Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.map((resident) => (
                    <tr key={resident.id} className="border-b table-row-hover">
                      <td className="px-4 py-2">
                        {resident.last_name}, {resident.first_name}{resident.middle_name ? `, ${resident.middle_name}` : ''}
                      </td>
                      <td className="px-4 py-2">{resident.household_number}</td>
                      <td className="px-4 py-2">{resident.age}</td>
                      <td className="px-4 py-2">{resident.contact_number || '-'}</td>
                      <td className="px-4 py-2">{resident.civil_status || '-'}</td>
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
                  disabled={pagination.currentPage === pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
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
