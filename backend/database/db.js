import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'ulevha.db');

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
