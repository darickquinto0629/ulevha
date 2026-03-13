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
    occupation: '',
    family_position: '',
    religion: '',
    educational_attainment: 'Elementary',
    educational_attainment_other: '',
    card_types: [],
    is_head_of_family: false,
    is_business_owner: false,
    business_name: '',
    business_type: '',
    business_address: '',
    business_phone: '',
  });

  const [errors, setErrors] = useState({});
  const [showAddNewConfirm, setShowAddNewConfirm] = useState(false);

  useEffect(() => {
    if (resident) {
      // Check if resident has any business data
      const hasBusinessData = Boolean(
        resident.is_business_owner || 
        resident.business_name || 
        resident.business_type || 
        resident.business_address ||
        resident.business_phone
      );
      
      // Ensure all fields default to empty string (not null) to avoid controlled/uncontrolled warnings
      setFormData({
        household_number: resident.household_number || '',
        philsys_number: resident.philsys_number || '',
        first_name: resident.first_name || '',
        last_name: resident.last_name || '',
        middle_name: resident.middle_name || '',
        gender: resident.gender || 'M',
        date_of_birth: resident.date_of_birth || '',
        birth_place: resident.birth_place || '',
        address: resident.address || '',
        contact_number: resident.contact_number || '',
        civil_status: resident.civil_status || 'Single',
        occupation: resident.occupation || '',
        family_position: resident.family_position || '',
        religion: resident.religion || '',
        educational_attainment: resident.educational_attainment || 'Elementary',
        educational_attainment_other: resident.educational_attainment_other || '',
        card_types: typeof resident.card_types === 'string' 
          ? JSON.parse(resident.card_types || '[]') 
          : (resident.card_types || []),
        is_head_of_family: resident.is_head_of_family || false,
        is_business_owner: hasBusinessData,
        business_name: resident.business_name || '',
        business_type: resident.business_type || '',
        business_address: resident.business_address || '',
        business_phone: resident.business_phone || '',
        // Keep id and resident_id for updates
        id: resident.id,
        resident_id: resident.resident_id || '',
      });
    }
  }, [resident]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.household_number) newErrors.household_number = 'House Number is required';
    if (!formData.first_name) newErrors.first_name = 'First Name is required';
    if (!formData.last_name) newErrors.last_name = 'Last Name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of Birth is required';
    if (!formData.address) newErrors.address = 'Street is required';

    if (formData.educational_attainment === 'Others please specify' && !formData.educational_attainment_other) {
      newErrors.educational_attainment_other = 'Please specify educational attainment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // For house number field, only allow numbers and prevent leading zeros
    if (name === 'household_number') {
      const numericValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    
    // For phone number fields, only allow numbers
    if (name === 'business_phone' || name === 'contact_number') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue,
      }));
      return;
    }
    
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

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentTypes = prev.card_types || [];
      return {
        ...prev,
        card_types: checked
          ? [...currentTypes, value]
          : currentTypes.filter(item => item !== value),
      };
    });
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getCardTypeOptions = () => {
    const baseOptions = ['Yellow Card', 'Blue Card', 'Green Card', 'PWD'];
    if (calculateAge(formData.date_of_birth) >= 60) {
      baseOptions.push('Senior Citizen Card');
    }
    return baseOptions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // Debug log
    console.log('[FORM] Submitting formData:', {
      is_business_owner: formData.is_business_owner,
      business_name: formData.business_name,
      business_type: formData.business_type,
      business_address: formData.business_address,
    });
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
              <label className="form-label">House Number *</label>
              <input
                type="text"
                name="household_number"
                value={formData.household_number}
                onChange={handleInputChange}
                className={inputClass('household_number')}
                placeholder="e.g., 123"
                inputMode="numeric"
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

          {/* Street */}
          <div className="form-group">
            <label className="form-label">Street *</label>
            <select
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={selectClass('address')}
            >
              <option value="">Select Street</option>
              <option value="Diamond">Diamond</option>
              <option value="Ruby">Ruby</option>
              <option value="Pearl">Pearl</option>
              <option value="Topaz">Topaz</option>
              <option value="Tourmaline">Tourmaline</option>
              <option value="Sapphire">Sapphire</option>
              <option value="Emerald">Emerald</option>
              <option value="Amethyst">Amethyst</option>
              <option value="Jade">Jade</option>
              <option value="Opal">Opal</option>
              <option value="Quartz">Quartz</option>
            </select>
            {errors.address && <p className="form-error">{errors.address}</p>}
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

          {/* Occupation and Family Position */}
          <div className="grid-2-cols">
            <div className="form-group">
              <label className="form-label">Occupation / Source of Income</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position in the Family</label>
              <input
                type="text"
                name="family_position"
                value={formData.family_position}
                onChange={handleInputChange}
                placeholder="ie: Mother, Father"
                className="form-input"
              />
            </div>
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
          <div className="grid-3-cols">
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

            <div className="form-group">
              <label className="form-label">Type of Card</label>
              <div className="space-y-2 mt-2">
                {getCardTypeOptions().map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      value={option}
                      checked={formData.card_types?.includes(option) || false}
                      onChange={handleCheckboxChange}
                      className="mr-2"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_head_of_family"
                  checked={formData.is_head_of_family || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_head_of_family: e.target.checked }))}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm">Head of the Family?</span>
              </label>
            </div>
          </div>

          {/* Business Owner Section */}
          <div className="form-group">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_business_owner"
                checked={formData.is_business_owner || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_business_owner: e.target.checked }))}
                className="mr-2 w-4 h-4"
              />
              <span className="form-label mb-0">Business Owner</span>
            </label>
          </div>

          {/* Business Details (shown when is_business_owner is checked) */}
          {formData.is_business_owner && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Business Information</h3>
              
              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Name of Establishment</label>
                  <input
                    type="text"
                    name="business_name"
                    value={formData.business_name || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter business name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nature of Establishment</label>
                  <input
                    type="text"
                    name="business_type"
                    value={formData.business_type || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Sari-sari Store, Carinderia"
                  />
                </div>
              </div>

              <div className="grid-2-cols">
                <div className="form-group">
                  <label className="form-label">Business Address </label>
                  <input
                    type="text"
                    name="business_address"
                    value={formData.business_address || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Leave blank if the same as your residential address."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Business Phone Number</label>
                  <input
                    type="tel"
                    name="business_phone"
                    value={formData.business_phone || ''}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter business phone number"
                  />
                </div>
              </div>
            </div>
          )}

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
