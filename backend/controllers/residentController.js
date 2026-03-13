import { dbRun, dbGet, dbAll } from '../database/db.js';
import { calculateAge, getAgeRangeCondition } from '../utils/validators.js';

// Get all residents with pagination
export const getAllResidents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const ageGroup = req.query.ageGroup || '';
    const gender = req.query.gender || '';
    const street = req.query.street || '';
    const cardType = req.query.cardType || '';
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

    // Add age group filter (calculated dynamically from date_of_birth)
    if (ageGroup) {
      const ageCondition = getAgeRangeCondition(ageGroup);
      if (ageCondition) {
        query += ` AND date_of_birth IS NOT NULL AND ${ageCondition}`;
        countQuery += ` AND date_of_birth IS NOT NULL AND ${ageCondition}`;
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

    // Add card type filter
    if (cardType) {
      query += ` AND card_types LIKE ?`;
      countQuery += ` AND card_types LIKE ?`;
      params = [...params, `%${cardType}%`];
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
      occupation,
      family_position,
      religion,
      educational_attainment,
      educational_attainment_other,
      card_types,
      is_head_of_family,
      is_business_owner,
      business_name,
      business_type,
      business_address,
      business_phone,
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
    const resident_id = `RES-${String(nextNumber).padStart(5, '0')}`;

    // Calculate age
    const age = calculateAge(date_of_birth);

    // Insert resident
    const result = await dbRun(
      `INSERT INTO residents (
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        occupation, family_position, religion, educational_attainment, educational_attainment_other, card_types,
        is_head_of_family, is_business_owner, business_name, business_type, business_address, business_phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        occupation, family_position, religion, educational_attainment, educational_attainment_other,
        card_types ? JSON.stringify(card_types) : null,
        is_head_of_family ? 1 : 0,
        is_business_owner ? 1 : 0, business_name, business_type, business_address, business_phone,
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

    // Audit log (fire and forget)
    if (req.user?.id) {
      dbRun(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, 'RESIDENT_CREATED', `Created resident: ${first_name} ${last_name} (${resident_id})`, req.ip || '', req.get('user-agent') || '']
      ).catch(() => {});
    }
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
      occupation,
      family_position,
      religion,
      educational_attainment,
      educational_attainment_other,
      card_types,
      is_head_of_family,
      is_business_owner,
      business_name,
      business_type,
      business_address,
      business_phone,
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
      const duplicateResidentId = await dbGet(
        'SELECT id FROM residents WHERE resident_id = ? AND id != ?',
        [resident_id, id]
      );
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
        occupation = COALESCE(?, occupation),
        family_position = COALESCE(?, family_position),
        religion = COALESCE(?, religion),
        educational_attainment = COALESCE(?, educational_attainment),
        educational_attainment_other = COALESCE(?, educational_attainment_other),
        card_types = COALESCE(?, card_types),
        is_head_of_family = ?,
        is_business_owner = ?,
        business_name = ?,
        business_type = ?,
        business_address = ?,
        business_phone = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        household_number, resident_id, philsys_number, first_name, last_name, middle_name,
        gender, date_of_birth, birth_place, age, address, contact_number, civil_status,
        occupation, family_position, religion, educational_attainment, educational_attainment_other,
        card_types ? JSON.stringify(card_types) : null,
        is_head_of_family ? 1 : 0,
        is_business_owner ? 1 : 0, business_name || '', business_type || '', 
        business_address || '', business_phone || '', id,
      ]
    );

    // Audit log (fire and forget)
    if (req.user?.id) {
      dbRun(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, 'RESIDENT_UPDATED', `Updated resident ID: ${id}`, req.ip || '', req.get('user-agent') || '']
      ).catch(() => {});
    }

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

    // Audit log (fire and forget)
    if (req.user?.id) {
      dbRun(
        `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, 'RESIDENT_DELETED', `Soft-deleted resident ID: ${id}`, req.ip || '', req.get('user-agent') || '']
      ).catch(() => {});
    }

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
    const { query, page = 1, limit = 10, ageGroup = '', gender = '', street = '', cardType = '' } = req.query;

    if (!query && !ageGroup && !gender && !street && !cardType) {
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

    // Add age group filter (calculated dynamically from date_of_birth)
    if (ageGroup) {
      const ageCondition = getAgeRangeCondition(ageGroup);
      if (ageCondition) {
        whereConditions.push(`date_of_birth IS NOT NULL AND ${ageCondition}`);
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

    // Add card type filter
    if (cardType) {
      whereConditions.push(`card_types LIKE ?`);
      params.push(`%${cardType}%`);
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

// Get business establishments (residents with is_business_owner = true)
export const getBusinessEstablishments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereConditions = ['is_business_owner = 1'];
    let params = [];

    if (search) {
      whereConditions.push(`(
        business_name LIKE ? OR 
        business_type LIKE ? OR 
        first_name LIKE ? OR 
        last_name LIKE ? OR
        business_address LIKE ? OR
        address LIKE ?
      )`);
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.join(' AND ');

    const businesses = await dbAll(
      `SELECT * FROM residents 
       WHERE ${whereClause}
       ORDER BY business_name ASC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const countResult = await dbGet(
      `SELECT COUNT(*) as count FROM residents WHERE ${whereClause}`,
      params
    );

    res.status(200).json({
      success: true,
      data: businesses,
      pagination: {
        page,
        limit,
        total: countResult.count,
        pages: Math.ceil(countResult.count / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching business establishments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch business establishments',
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

    // Optimized: Calculate age distribution directly in SQL instead of fetching all rows
    const ageCalc = "CAST((julianday('now') - julianday(date_of_birth)) / 365.25 AS INTEGER)";
    const byAge = await dbAll(`
      SELECT 
        CASE 
          WHEN ${ageCalc} <= 17 THEN '0-17'
          WHEN ${ageCalc} <= 30 THEN '18-30'
          WHEN ${ageCalc} <= 45 THEN '31-45'
          WHEN ${ageCalc} <= 59 THEN '46-59'
          ELSE '60+'
        END as ageGroup,
        COUNT(*) as count
      FROM residents 
      WHERE is_active = 1 AND date_of_birth IS NOT NULL
      GROUP BY ageGroup
      ORDER BY 
        CASE ageGroup
          WHEN '0-17' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-45' THEN 3
          WHEN '46-59' THEN 4
          ELSE 5
        END
    `);

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
