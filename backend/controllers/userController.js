import db from '../database/db.js';

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
      else resolve(rows);
    });
  });
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `SELECT u.id, u.name, u.email, u.role_id, u.date_of_birth, u.gender, u.address, u.phone, u.is_active, u.created_at, r.name as role 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    const params = [];

    if (role) {
      query += ` AND r.name = ?`;
      countQuery += ` AND role_id = (SELECT id FROM roles WHERE name = ?)`;
      params.push(role);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
      countQuery += ` AND (name LIKE ? OR email LIKE ?)`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const countResult = await dbGet(countQuery, params);
    const total = countResult.total;

    // Get paginated results - sort by role (admin first) then by name
    query += ` ORDER BY CASE WHEN r.name = 'admin' THEN 0 ELSE 1 END, u.name ASC LIMIT ? OFFSET ?`;
    const users = await dbAll(query, [...params, parseInt(limit), offset]);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Users retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
    });
  }
};

// Get single user
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await dbGet(
      `SELECT u.id, u.name, u.email, u.date_of_birth, u.gender, u.address, u.phone, u.is_active, u.created_at, u.updated_at, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'User retrieved successfully',
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve user',
    });
  }
};

// Create user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', date_of_birth, gender, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    if (!date_of_birth || !gender || !address || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Date of birth, gender, address, and phone are required',
      });
    }

    // Check if user exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists',
      });
    }

    // Get role ID
    const roleData = await dbGet('SELECT id FROM roles WHERE name = ?', [role]);
    if (!roleData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role',
      });
    }

    // Hash password
    const bcryptjs = await import('bcryptjs');
    const hashedPassword = await bcryptjs.default.hash(password, 10);

    // Create user
    const result = await dbRun(
      `INSERT INTO users (name, email, password, role_id, date_of_birth, gender, address, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, roleData.id, date_of_birth || null, gender || null, address || null, phone || null]
    );

    // Log action
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        'USER_CREATED',
        `Created user: ${email}`,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.lastID,
        name,
        email,
        role,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, date_of_birth, gender, address, phone, is_active } = req.body;

    // Check if user exists
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if email is already taken (if changed)
    if (email) {
      const emailExists = await dbGet('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already in use',
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (password) {
      const bcryptjs = await import('bcryptjs');
      const hashedPassword = await bcryptjs.default.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }
    if (date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      params.push(date_of_birth || null);
    }
    if (gender) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (address) {
      updates.push('address = ?');
      params.push(address);
    }
    if (phone) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await dbRun(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Log action
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        'USER_UPDATED',
        `Updated user: ${id}`,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
      ]
    );

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await dbGet('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Delete user
    await dbRun('DELETE FROM users WHERE id = ?', [id]);

    // Log action
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.id,
        'USER_DELETED',
        `Deleted user: ${id}`,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
      ]
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
};
