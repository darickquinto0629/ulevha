import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/apiConfig';

export default function ResidentForm({ resident, onSubmit, isLoading, onAddNew }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    household_number: '',
    philsys_number: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    gender: 'M',
    date_of_birth: '',
    birth_place: '',
    address: '',
    contact_number: '',
    civil_status: 'Single',
    religion: '',
    educational_attainment: 'Elementary',
    educational_attainment_other: '',
  });

  const [errors, setErrors] = useState({});
  const [showAddNewConfirm, setShowAddNewConfirm] = useState(false);

  useEffect(() => {
    if (resident) {
      setFormData(resident);
    }
  }, [resident]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.household_number) newErrors.household_number = 'Household Number is required';
    if (!formData.first_name) newErrors.first_name = 'First Name is required';
    if (!formData.last_name) newErrors.last_name = 'Last Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required';
    if (!formData.address) newErrors.address = 'Address is required';

    if (formData.educational_attainment === 'Others please specify' && !formData.educational_attainment_other) {
      newErrors.educational_attainment_other = 'Please specify educational attainment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Convert text fields to uppercase (exclude date, tel, select, radio)
    const shouldUppercase = type === 'text' || type === 'textarea';
    const processedValue = shouldUppercase ? value.toUpperCase() : value;
    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  // Helper to get input class based on error state
  const inputClass = (field) => errors[field] ? 'form-input-error' : 'form-input';
  const selectClass = (field) => errors[field] ? 'form-select-error' : 'form-select';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resident ? 'Edit Resident' : 'Add New Resident'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Household and IDs */}
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Household Number *</label>
              <input
                type="text"
                name="household_number"
                value={formData.household_number}
                onChange={handleInputChange}
                className={inputClass('household_number')}
                placeholder="e.g., HH-001"
              />
              {errors.household_number && <p className="form-error">{errors.household_number}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">PhilSys Card Number</label>
              <input
                type="text"
                name="philsys_number"
                value={formData.philsys_number}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid-3-cols">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={inputClass('first_name')}
              />
              {errors.first_name && <p className="form-error">{errors.first_name}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={inputClass('last_name')}
              />
              {errors.last_name && <p className="form-error">{errors.last_name}</p>}
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid-2-cols">
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
              {errors.gender && <p className="form-error">{errors.gender}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={inputClass('date_of_birth')}
              />
              {errors.date_of_birth && <p className="form-error">{errors.date_of_birth}</p>}
            </div>
          </div>

          {/* Birth Info */}
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Birth Place</label>
              <input
                type="text"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Civil Status</label>
              <select
                name="civil_status"
                value={formData.civil_status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={inputClass('address')}
              rows="3"
            />
            {errors.address && <p className="form-error">{errors.address}</p>}
          </div>

          {/* Contact and Religion */}
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Religion</label>
              <input
                type="text"
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          {/* Educational Attainment */}
          <div className="form-group">
            <label className="form-label">Highest Educational Attainment</label>
            <div className="space-y-2 mt-2">
              {['Elementary', 'Highschool', 'College Undergraduate', 'College Graduate', 'Post Graduate', 'Vocational', 'Others please specify'].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="educational_attainment"
                    value={option}
                    checked={formData.educational_attainment === option}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>

            {formData.educational_attainment === 'Others please specify' && (
              <div className="mt-2">
                <input
                  type="text"
                  name="educational_attainment_other"
                  value={formData.educational_attainment_other}
                  onChange={handleInputChange}
                  placeholder="Please specify"
                  className={inputClass('educational_attainment_other')}
                />
                {errors.educational_attainment_other && <p className="form-error">{errors.educational_attainment_other}</p>}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Saving...' : resident ? 'Update Resident' : 'Add Resident'}
            </Button>
            {resident && onAddNew && (
              <Button type="button" onClick={() => setShowAddNewConfirm(true)} className="bg-green-600 hover:bg-green-700">
                + Add New Resident
              </Button>
            )}
          </div>
        </form>

        {/* Add New Confirmation Modal */}
        {showAddNewConfirm && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 flex flex-col gap-4 shadow-2xl border border-gray-200 max-w-md">
              <h3 className="text-lg font-semibold text-gray-800">Add New Resident?</h3>
              <p className="text-gray-600">This will clear the current form and start a new entry. Are you sure?</p>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddNewConfirm(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowAddNewConfirm(false);
                    onAddNew();
                  }}
                >
                  Yes, Add New
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
