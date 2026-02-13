import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database/db.js';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';
const EXPIRE = process.env.JWT_EXPIRE || '24h';

// Helper function to promisify database operations
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await dbGet(
      `SELECT u.*, r.name as role FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      SECRET,
      {
        expiresIn: EXPIRE,
      }
    );

    // Log login action
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        user.id,
        'LOGIN',
        'User logged in',
        req.ip || req.connection.remoteAddress,
        req.get('user-agent'),
      ]
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      data: {
        token,
        user: userWithoutPassword,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login',
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'staff', age, gender, address, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered',
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbRun(
      `INSERT INTO users (name, email, password, role_id, age, gender, address, phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, roleData.id, age || null, gender || null, address || null, phone || null]
    );

    // Log registration
    await dbRun(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
      [
        result.lastID,
        'REGISTER',
        `User registered with role: ${role}`,
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
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, SECRET);

    // Get fresh user data from database
    const user = await dbGet(
      `SELECT u.id, u.name, u.email, u.is_active, r.name as role FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'User not found or inactive',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Token verified',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }
    res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }
};
