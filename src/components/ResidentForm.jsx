import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiUrl } from '@/lib/apiConfig';

export default function ResidentForm({ resident, onSubmit, isLoading }) {
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{resident ? 'Edit Resident' : 'Add New Resident'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Household and IDs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Household Number *</label>
              <input
                type="text"
                name="household_number"
                value={formData.household_number}
                onChange={handleInputChange}
                // disabled={resident}
                className={`w-full px-3 py-2 border rounded-md ${errors.household_number ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="e.g., HH-001"
              />
              {errors.household_number && <p className="text-red-500 text-xs mt-1">{errors.household_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PhilSys Card Number</label>
              <input
                type="text"
                name="philsys_number"
                value={formData.philsys_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth *</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
            </div>
          </div>

          {/* Birth Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Birth Place</label>
              <input
                type="text"
                name="birth_place"
                value={formData.birth_place}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Civil Status</label>
              <select
                name="civil_status"
                value={formData.civil_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          {/* Address and Contact */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                rows="3"
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          {/* Contact and Religion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Number</label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Religion</label>
              <input
                type="text"
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Educational Attainment */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Highest Educational Attainment</label>
            <div className="space-y-2">
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
              <div>
                <input
                  type="text"
                  name="educational_attainment_other"
                  value={formData.educational_attainment_other}
                  onChange={handleInputChange}
                  placeholder="Please specify"
                  className={`w-full px-3 py-2 border rounded-md ${errors.educational_attainment_other ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.educational_attainment_other && <p className="text-red-500 text-xs mt-1">{errors.educational_attainment_other}</p>}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : resident ? 'Update Resident' : 'Add Resident'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
