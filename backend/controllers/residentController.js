import db from '../database/db.js';

// Helper functions to promisify database operations
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

// Helper function to get age range condition for SQL
const getAgeRangeCondition = (ageGroup) => {
  const ageRanges = {
    '0-17': { min: 0, max: 17 },
    '18-30': { min: 18, max: 30 },
    '31-45': { min: 31, max: 45 },
    '46-59': { min: 46, max: 59 },
    '60+': { min: 60, max: 200 },
  };
  return ageRanges[ageGroup] || null;
};

// Get all residents with pagination
export const getAllResidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const ageGroup = req.query.ageGroup || '';
    const gender = req.query.gender || '';
    const street = req.query.street || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM residents WHERE is_active = 1';
    let countQuery = 'SELECT COUNT(*) as count FROM residents WHERE is_active = 1';
    let params = [];

    // Add search filter
    if (search) {
      const searchTerm = `%${search}%`;
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR household_number LIKE ? OR resident_id LIKE ? OR contact_number LIKE ?)`;
      countQuery += ` AND (first_name LIKE ? OR last_name LIKE ? OR household_number LIKE ? OR resident_id LIKE ? OR contact_number LIKE ?)`;
      params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    }

    // Add age group filter
    if (ageGroup) {
      const ageRange = getAgeRangeCondition(ageGroup);
      if (ageRange) {
        query += ` AND age >= ? AND age <= ?`;
        countQuery += ` AND age >= ? AND age <= ?`;
        params = [...params, ageRange.min, ageRange.max];
      }
    }

    // Add gender filter
    if (gender) {
      query += ` AND gender = ?`;
      countQuery += ` AND gender = ?`;
      params = [...params, gender];
    }

    // Add street filter
    if (street) {
      query += ` AND address = ?`;
      countQuery += ` AND address = ?`;
      params = [...params, street];
    }

    // Get total count
    const countResult = await dbGet(countQuery, params);
    const total = countResult.count;

    // Get paginated results
    query += ' ORDER BY last_name ASC LIMIT ? OFFSET ?';
    const residents = await dbAll(query, [...params, limit, offset]);

    res.status(200).json({
      success: true,
      data: residents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching residents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch residents',
    });
  }
};

// Get single resident by ID
export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const resident = await dbGet(
      'SELECT * FROM residents WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!resident) {
      return res.status(404).json({
        success: false,
        error: 'Resident not found',
      });
    }

    res.status(200).json({
      success: true,
      data: resident,
    });
  } catch (error) {
    console.error('Error fetching resident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resident',
    });
  }
};

// Create new resident
export const createResident = async (req, res) => {
  try {
    const {
      household_number,
      philsys_number,
      first_name,
      last_name,
      middle_name,
      gender,
      date_of_birth,
      birth_place,
      address,
      contact_number,
      civil_status,
      religion,
      educational_attainment,
      educational_attainment_other,
    } = req.body || {};

    // Validate required fields
    const missingFields = [];
    if (!household_number) missingFields.push('household_number');
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!gender) missingFields.push('gender');
    if (!date_of_birth) missingFields.push('date_of_birth');
    if (!address) missingFields.push('address');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Auto-generate resident_id: get the max ID and increment
    const maxIdResult = await dbGet(
      'SELECT MAX(CAST(SUBSTR(resident_id, 5) AS INTEGER)) as max_id FROM residents WHERE resident_id LIKE "RES-%"'
    );
    
    const nextNumber = (maxIdResult?.max_id || 0) + 1;
    const resident_id = `RES-${String(nextNumber).padStart(3, '0')}`;

    // Calculate age
    const age = calculateAge(date_of_birth);

    // Insert resident
    const result = await dbRun(
      `INSERT INTO residents (
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        religion, educational_attainment, educational_attainment_other
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        religion, educational_attainment, educational_attainment_other,
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        household_number,
        resident_id,
        first_name,
        last_name,
        age,
      },
      message: 'Resident created successfully',
    });
  } catch (error) {
    console.error('Error creating resident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create resident',
    });
  }
};

// Update resident
export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      household_number,
      resident_id,
      philsys_number,
      first_name,
      last_name,
      middle_name,
      gender,
      date_of_birth,
      birth_place,
      address,
      contact_number,
      civil_status,
      religion,
      educational_attainment,
      educational_attainment_other,
    } = req.body;

    // Check if resident exists
    const resident = await dbGet('SELECT id FROM residents WHERE id = ?', [id]);
    if (!resident) {
      return res.status(404).json({
        success: false,
        error: 'Resident not found',
      });
    }

    // Check if resident_id already exists (for other residents)
    // Note: household_number is NOT unique - multiple residents can share the same household
    if (resident_id) {
      console.log('[UPDATE] Checking duplicate resident_id:', resident_id, 'for id:', id);
      const duplicateResidentId = await dbGet(
        'SELECT id FROM residents WHERE resident_id = ? AND id != ?',
        [resident_id, id]
      );
      console.log('[UPDATE] Duplicate resident_id check result:', duplicateResidentId);
      if (duplicateResidentId) {
        return res.status(400).json({
          success: false,
          error: 'Resident ID already exists',
        });
      }
    }

    // Calculate age if date_of_birth is provided
    let age = null;
    if (date_of_birth) {
      age = calculateAge(date_of_birth);
    }

    // Update resident
    await dbRun(
      `UPDATE residents SET
        household_number = COALESCE(?, household_number),
        resident_id = COALESCE(?, resident_id),
        philsys_number = COALESCE(?, philsys_number),
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        middle_name = COALESCE(?, middle_name),
        gender = COALESCE(?, gender),
        date_of_birth = COALESCE(?, date_of_birth),
        birth_place = COALESCE(?, birth_place),
        age = COALESCE(?, age),
        address = COALESCE(?, address),
        contact_number = COALESCE(?, contact_number),
        civil_status = COALESCE(?, civil_status),
        religion = COALESCE(?, religion),
        educational_attainment = COALESCE(?, educational_attainment),
        educational_attainment_other = COALESCE(?, educational_attainment_other),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        religion, educational_attainment, educational_attainment_other, id,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Resident updated successfully',
    });
  } catch (error) {
    console.error('Error updating resident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update resident',
    });
  }
};

// Delete resident (soft delete)
export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resident exists
    const resident = await dbGet('SELECT id FROM residents WHERE id = ?', [id]);
    if (!resident) {
      return res.status(404).json({
        success: false,
        error: 'Resident not found',
      });
    }

    // Soft delete - mark as inactive
    await dbRun('UPDATE residents SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Resident deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting resident:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resident',
    });
  }
};

// Search residents
export const searchResidents = async (req, res) => {
  try {
    const { query, page = 1, limit = 10, ageGroup = '', gender = '', street = '' } = req.query;

    if (!query && !ageGroup && !gender && !street) {
      return res.status(400).json({
        success: false,
        error: 'Search query or filter is required',
      });
    }

    const searchTerm = query ? `%${query}%` : '';
    const offset = (page - 1) * limit;
    let params = [];
    let whereConditions = ['is_active = 1'];

    // Add search filter
    if (query) {
      whereConditions.push(`(
         first_name LIKE ? OR 
         last_name LIKE ? OR 
         household_number LIKE ? OR 
         resident_id LIKE ? OR 
         contact_number LIKE ?
       )`);
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Add age group filter
    if (ageGroup) {
      const ageRange = getAgeRangeCondition(ageGroup);
      if (ageRange) {
        whereConditions.push(`age >= ? AND age <= ?`);
        params.push(ageRange.min, ageRange.max);
      }
    }

    // Add gender filter
    if (gender) {
      whereConditions.push(`gender = ?`);
      params.push(gender);
    }

    // Add street filter
    if (street) {
      whereConditions.push(`address = ?`);
      params.push(street);
    }

    const whereClause = whereConditions.join(' AND ');

    const residents = await dbAll(
      `SELECT * FROM residents 
       WHERE ${whereClause}
       ORDER BY last_name ASC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await dbGet(
      `SELECT COUNT(*) as count FROM residents 
       WHERE ${whereClause}`,
      params
    );

    res.status(200).json({
      success: true,
      data: residents,
      pagination: {
        page,
        limit,
        total: countResult.count,
        pages: Math.ceil(countResult.count / limit),
      },
    });
  } catch (error) {
    console.error('Error searching residents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search residents',
    });
  }
};

// Get resident statistics
export const getResidentStats = async (req, res) => {
  try {
    const totalResidents = await dbGet(
      'SELECT COUNT(*) as count FROM residents WHERE is_active = 1'
    );

    const byGender = await dbAll(
      'SELECT gender, COUNT(*) as count FROM residents WHERE is_active = 1 GROUP BY gender'
    );

    const byEdAttainment = await dbAll(
      'SELECT educational_attainment, COUNT(*) as count FROM residents WHERE is_active = 1 GROUP BY educational_attainment'
    );

    const byStreet = await dbAll(
      'SELECT address as street, COUNT(*) as count FROM residents WHERE is_active = 1 AND address IS NOT NULL AND address != "" GROUP BY address ORDER BY count DESC'
    );

    // Get all residents with date_of_birth to calculate age distribution
    const residents = await dbAll(
      'SELECT date_of_birth FROM residents WHERE is_active = 1 AND date_of_birth IS NOT NULL'
    );

    // Calculate age distribution
    const ageGroups = {
      '0-17': 0,
      '18-30': 0,
      '31-45': 0,
      '46-59': 0,
      '60+': 0,
    };

    residents.forEach((resident) => {
      const age = calculateAge(resident.date_of_birth);
      if (age <= 17) ageGroups['0-17']++;
      else if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 59) ageGroups['46-59']++;
      else ageGroups['60+']++;
    });

    const byAge = Object.entries(ageGroups).map(([ageGroup, count]) => ({
      ageGroup,
      count,
    }));

    res.status(200).json({
      success: true,
      data: {
        total: totalResidents.count,
        byGender,
        byAge,
        byStreet,
        byEducationalAttainment: byEdAttainment,
      },
    });
  } catch (error) {
    console.error('Error fetching resident stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};
