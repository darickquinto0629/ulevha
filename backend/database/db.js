import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Current schema version - increment this when adding new migrations
const CURRENT_SCHEMA_VERSION = 3;

// Determine database path based on environment
function getDatabasePath() {
  const isElectronProd = process.env.NODE_ENV === 'production' && 
    (process.versions && process.versions.electron);
  
  if (isElectronProd) {
    const userDataPath = process.env.ULEVHA_USER_DATA || 
      path.join(process.env.APPDATA || process.env.HOME, 'Ulevha');
    
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    return path.join(userDataPath, 'ulevha.db');
  }
  
  return path.resolve(__dirname, 'ulevha.db');
}

const dbPath = getDatabasePath();
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✓ Connected to SQLite database');
    runMigrations();
  }
});

// Helper: Check if a table exists
function tableExists(tableName) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
}

// Helper: Check if a column exists in a table
function columnExists(tableName, columnName) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (err) reject(err);
      else resolve(columns.some(col => col.name === columnName));
    });
  });
}

// Helper: Add column if it doesn't exist
function addColumnIfNotExists(tableName, columnName, columnDef) {
  return new Promise(async (resolve, reject) => {
    try {
      const exists = await columnExists(tableName, columnName);
      if (!exists) {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`, (err) => {
          if (err) reject(err);
          else {
            console.log(`  ✓ Added column ${columnName} to ${tableName}`);
            resolve(true);
          }
        });
      } else {
        resolve(false);
      }
    } catch (err) {
      reject(err);
    }
  });
}

// Helper: Run a SQL statement as a promise
function runSQL(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// ============================================
// Centralized Database Helpers (for controllers)
// ============================================

/**
 * Run an INSERT/UPDATE/DELETE query
 * @returns {Promise<{lastID: number, changes: number}>}
 */
export function dbRun(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Get a single row
 * @returns {Promise<Object|undefined>}
 */
export function dbGet(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Get all matching rows
 * @returns {Promise<Array>}
 */
export function dbAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

// Helper: Get current schema version
function getSchemaVersion() {
  return new Promise(async (resolve) => {
    const exists = await tableExists('schema_version');
    if (!exists) {
      resolve(0);
      return;
    }
    db.get('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1', (err, row) => {
      resolve(row ? row.version : 0);
    });
  });
}

// Helper: Set schema version
function setSchemaVersion(version) {
  return runSQL(
    'INSERT INTO schema_version (version, applied_at) VALUES (?, datetime("now"))',
    [version]
  );
}

// Migration 1: Initial schema with all base tables
async function migration_v1() {
  console.log('  Running migration v1: Initial schema...');
  
  // Schema version tracking table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Roles table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS users (
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
    )
  `);

  // Audit logs table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      description TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Analytics table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      age_group TEXT,
      gender TEXT,
      count INTEGER,
      month TEXT,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Residents table
  await runSQL(`
    CREATE TABLE IF NOT EXISTS residents (
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
    )
  `);

  // Insert default roles
  await runSQL(`
    INSERT OR IGNORE INTO roles (id, name, description) VALUES 
    (1, 'admin', 'Administrator with full system access'),
    (2, 'staff', 'Staff member with limited access')
  `);

  console.log('  ✓ Migration v1 complete');
}

// Migration 2: Add business and family columns to residents
async function migration_v2() {
  console.log('  Running migration v2: Business and family fields...');
  
  const columnsToAdd = [
    { name: 'is_business_owner', def: 'BOOLEAN DEFAULT 0' },
    { name: 'business_name', def: 'TEXT' },
    { name: 'business_type', def: 'TEXT' },
    { name: 'business_address', def: 'TEXT' },
    { name: 'business_phone', def: 'TEXT' },
    { name: 'is_head_of_family', def: 'BOOLEAN DEFAULT 0' },
    { name: 'occupation', def: 'TEXT' },
    { name: 'family_position', def: 'TEXT' },
  ];

  for (const col of columnsToAdd) {
    await addColumnIfNotExists('residents', col.name, col.def);
  }

  console.log('  ✓ Migration v2 complete');
}

// Migration 3: Add performance indexes
async function migration_v3() {
  console.log('  Running migration v3: Performance indexes...');
  
  const indexes = [
    { name: 'idx_residents_resident_id', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_resident_id ON residents(resident_id)' },
    { name: 'idx_residents_household', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_household ON residents(household_number)' },
    { name: 'idx_residents_active', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_active ON residents(is_active)' },
    { name: 'idx_residents_business', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_business ON residents(is_business_owner)' },
    { name: 'idx_residents_name', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_name ON residents(last_name, first_name)' },
    { name: 'idx_residents_address', sql: 'CREATE INDEX IF NOT EXISTS idx_residents_address ON residents(address)' },
    { name: 'idx_users_email', sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)' },
    { name: 'idx_audit_user', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)' },
    { name: 'idx_audit_action', sql: 'CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)' },
  ];

  for (const index of indexes) {
    try {
      await runSQL(index.sql);
      console.log(`  ✓ Created index ${index.name}`);
    } catch (err) {
      // Index might already exist, that's fine
      if (!err.message.includes('already exists')) {
        console.error(`  ✗ Failed to create index ${index.name}:`, err.message);
      }
    }
  }

  console.log('  ✓ Migration v3 complete');
}

// Registry of all migrations (add new migrations here)
const MIGRATIONS = [
  { version: 1, fn: migration_v1 },
  { version: 2, fn: migration_v2 },
  { version: 3, fn: migration_v3 },
  // Add future migrations here:
  // { version: 4, fn: migration_v4 },
];

// Main migration runner
async function runMigrations() {
  try {
    // First ensure schema_version table exists
    const schemaTableExists = await tableExists('schema_version');
    
    let currentVersion = 0;
    
    if (schemaTableExists) {
      currentVersion = await getSchemaVersion();
    } else {
      // Check if this is an existing database (has tables but no version tracking)
      const hasResidents = await tableExists('residents');
      const hasUsers = await tableExists('users');
      
      if (hasResidents || hasUsers) {
        console.log('→ Existing database detected, checking schema...');
        // Create schema_version and mark existing migrations as applied
        await runSQL(`
          CREATE TABLE IF NOT EXISTS schema_version (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Check which columns exist to determine current state
        const hasBusiness = await columnExists('residents', 'is_business_owner').catch(() => false);
        
        if (hasBusiness) {
          // All migrations already applied
          await setSchemaVersion(1);
          await setSchemaVersion(2);
          currentVersion = 2;
          console.log('✓ Existing schema detected at version 2');
        } else if (hasResidents) {
          // Only v1 applied
          await setSchemaVersion(1);
          currentVersion = 1;
          console.log('✓ Existing schema detected at version 1');
        }
      }
    }

    console.log(`Current schema version: ${currentVersion}`);
    console.log(`Target schema version: ${CURRENT_SCHEMA_VERSION}`);

    if (currentVersion >= CURRENT_SCHEMA_VERSION) {
      console.log('✓ Database schema is up to date');
      return;
    }

    console.log('Running database migrations...');

    // Run pending migrations
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        await migration.fn();
        await setSchemaVersion(migration.version);
      }
    }

    console.log('✓ All migrations completed successfully');
    console.log('✓ Database schema initialized successfully');

  } catch (err) {
    console.error('Migration error:', err);
  }
}

export default db;
export { tableExists, columnExists, addColumnIfNotExists, getSchemaVersion, runSQL };
