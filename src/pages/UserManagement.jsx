import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/apiConfig';

export default function UserManagement() {
  const location = useLocation();
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pages: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const dashboardPath = '/admin/dashboard';

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
    fetchUsers();
  }, [pagination.currentPage, pagination.pageSize, searchQuery]);

  const fetchUsers = async () => {
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

      const response = await fetch(`${apiUrl}/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data?.users || []);
      setPagination(prev => ({
        ...prev,
        total: data.data?.pagination?.total || 0,
        pages: data.data?.pagination?.pages || 0,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      date_of_birth: '',
      gender: '',
      address: '',
      phone: '',
    });
    setFormErrors({});
  };

  const handleAddClick = () => {
    resetForm();
    setSelectedUser(null);
    setActiveTab('add');
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'staff',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      address: user.address || '',
      phone: user.phone || '',
    });
    setFormErrors({});
    setActiveTab('edit');
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const shouldUppercase = type === 'text' && name !== 'email' && name !== 'password';
    const processedValue = shouldUppercase ? value.toUpperCase() : value;
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!selectedUser && !formData.password) errors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of Birth is required';
    if (!formData.gender) errors.gender = 'Gender is required';
    if (!formData.address) errors.address = 'Address is required';
    if (!formData.phone) errors.phone = 'Phone is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async () => {
    const isEditingUser = !!selectedUser?.id;
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const apiUrl = getApiUrl();
      const endpoint = isEditingUser
        ? `${apiUrl}/users/${selectedUser.id}`
        : `${apiUrl}/users`;

      const method = isEditingUser ? 'PUT' : 'POST';

      // Don't send empty password on edit
      const submitData = { ...formData };
      if (isEditingUser && !submitData.password) {
        delete submitData.password;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user');
      }

      setMessage(`User ${isEditingUser ? 'updated' : 'created'} successfully!`);
      setSuccessMessage(`User ${isEditingUser ? 'updated' : 'created'} successfully!`);
      setShowSuccessPopup(true);
      
      if (isEditingUser) {
        // Stay on edit form, just clear password field
        setFormData(prev => ({ ...prev, password: '' }));
        setShowPassword(false);
      } else {
        // Go back to list only for new users
        setActiveTab('list');
        resetForm();
        setSelectedUser(null);
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setDeleteConfirm(null);
      setMessage('User deleted successfully!');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      fetchUsers();
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

  const inputClass = (field) => formErrors[field] ? 'form-input-error' : 'form-input';
  const selectClass = (field) => formErrors[field] ? 'form-select-error' : 'form-select';

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
          <h2 className="page-title">User Management</h2>
        </div>
        {activeTab === 'list' && (
          <Button onClick={handleAddClick} className="bg-green-600 hover:bg-green-700">
            + Add New User
          </Button>
        )}
      </div>

      {/* Error Message */}
      {message && message.includes('Error') && (
        <div className="message-error">
          {message}
        </div>
      )}

      {/* Search Bar (only on list view) */}
      {activeTab === 'list' && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input max-w-md"
          />
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="message-error mb-4">{error}</div>}

            {loading && users.length === 0 ? (
              <div className="text-center py-4">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <>
                <div className="table-container">
                  <table className="w-full text-sm">
                    <thead className="table-header border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Name</th>
                        <th className="px-4 py-2 text-left font-semibold">Email</th>
                        <th className="px-4 py-2 text-left font-semibold">Role</th>
                        <th className="px-4 py-2 text-left font-semibold">Status</th>
                        <th className="px-4 py-2 text-left font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b table-row-hover">
                          <td className="px-4 py-2">{user.name}</td>
                          <td className="px-4 py-2">{user.email}</td>
                          <td className="px-4 py-2">
                            <Badge className={user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-2">
                            <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            <button onClick={() => handleEditClick(user)} className="text-blue-600 hover:text-blue-800 text-sm">
                              Edit
                            </button>
                            <button onClick={() => handleToggleActive(user)} className="text-yellow-600 hover:text-yellow-800 text-sm">
                              {user.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => setDeleteConfirm(user.id)} className="text-red-600 hover:text-red-800 text-sm">
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="pagination">
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
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Form */}
      {(activeTab === 'add' || activeTab === 'edit') && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedUser ? 'Edit User' : 'Add New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClass('name')}
                  />
                  {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass('email')}
                  />
                  {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Password {selectedUser ? '(leave blank to keep current)' : '*'}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${inputClass('password')} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formErrors.password && <p className="form-error">{formErrors.password}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={selectClass('role')}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={inputClass('date_of_birth')}
                  />
                  {formErrors.date_of_birth && <p className="form-error">{formErrors.date_of_birth}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={selectClass('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.gender && <p className="form-error">{formErrors.gender}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={inputClass('address')}
                  rows="2"
                />
                {formErrors.address && <p className="form-error">{formErrors.address}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={inputClass('phone')}
                />
                {formErrors.phone && <p className="form-error">{formErrors.phone}</p>}
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Saving...' : selectedUser ? 'Update User' : 'Create User'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setActiveTab('list'); resetForm(); setSelectedUser(null); }}>
                  {selectedUser ? 'Back to List' : 'Cancel'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this user?</p>
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
