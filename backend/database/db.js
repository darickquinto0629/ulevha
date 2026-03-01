import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database path based on environment
function getDatabasePath() {
  // Check if running in Electron production mode
  const isElectronProd = process.env.NODE_ENV === 'production' && 
    (process.versions && process.versions.electron);
  
  if (isElectronProd) {
    // In production Electron, use userData directory (writable location)
    // This will be set by main.cjs before importing this module
    const userDataPath = process.env.ULEVHA_USER_DATA || 
      path.join(process.env.APPDATA || process.env.HOME, 'Ulevha');
    
    // Ensure the directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    const dbPath = path.join(userDataPath, 'ulevha.db');
    
    // Copy template database if it doesn't exist yet
    if (!fs.existsSync(dbPath)) {
      const templatePath = path.resolve(__dirname, 'ulevha.db');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, dbPath);
        console.log('✓ Database copied to user data directory');
      }
    }
    
    return dbPath;
  }
  
  // Development: use local database
  return path.resolve(__dirname, 'ulevha.db');
}

const dbPath = getDatabasePath();
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✓ Connected to SQLite database');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Create Roles table
    db.run(
      `CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) console.error('Error creating roles table:', err);
      }
    );

    // Create Users table
    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role_id INTEGER NOT NULL,
        date_of_birth TEXT,
        gender TEXT,
        address TEXT,
        phone TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )`,
      (err) => {
        if (err) console.error('Error creating users table:', err);
      }
    );

    // Create Audit Logs table
    db.run(
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        description TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`,
      (err) => {
        if (err) console.error('Error creating audit_logs table:', err);
      }
    );

    // Create Analytics table for storing age/gender data
    db.run(
      `CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        age_group TEXT,
        gender TEXT,
        count INTEGER,
        month TEXT,
        year INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) console.error('Error creating analytics table:', err);
      }
    );

    // Create Residents table
    db.run(
      `CREATE TABLE IF NOT EXISTS residents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        household_number TEXT NOT NULL,
        resident_id TEXT UNIQUE NOT NULL,
        philsys_number TEXT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        middle_name TEXT,
        gender TEXT NOT NULL,
        date_of_birth DATE NOT NULL,
        birth_place TEXT,
        age INTEGER,
        address TEXT NOT NULL,
        contact_number TEXT,
        civil_status TEXT,
        religion TEXT,
        educational_attainment TEXT,
        educational_attainment_other TEXT,
        card_types TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) console.error('Error creating residents table:', err);
      }
    );

    // Insert default roles if they don't exist
    db.run(
      `INSERT OR IGNORE INTO roles (id, name, description) VALUES 
       (1, 'admin', 'Administrator with full system access'),
       (2, 'staff', 'Staff member with limited access')`,
      (err) => {
        if (err) console.error('Error inserting roles:', err);
        else console.log('✓ Default roles initialized');
      }
    );

    console.log('✓ Database schema initialized successfully');
  });
};

export default db;
