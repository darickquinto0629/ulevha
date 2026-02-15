import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'backend/database/ulevha.db');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Create new table without UNIQUE on household_number
  db.run(`CREATE TABLE IF NOT EXISTS residents_new (
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
  )`, (err) => {
    if (err) console.error('Error creating new table:', err);
    else console.log('Created new table');
  });

  // Copy data
  db.run(`INSERT INTO residents_new SELECT * FROM residents`, (err) => {
    if (err) console.error('Error copying data:', err);
    else console.log('Copied data');
  });

  // Drop old table
  db.run(`DROP TABLE residents`, (err) => {
    if (err) console.error('Error dropping old table:', err);
    else console.log('Dropped old table');
  });

  // Rename new table
  db.run(`ALTER TABLE residents_new RENAME TO residents`, (err) => {
    if (err) console.error('Error renaming table:', err);
    else console.log('Renamed table');
  });
});

setTimeout(() => {
  db.close();
  console.log('Migration complete: household_number is no longer unique');
}, 1000);
