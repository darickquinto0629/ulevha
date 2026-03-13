import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'backend/database/ulevha.db');
console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to database');
});

const columns = [
  { name: 'is_business_owner', type: 'BOOLEAN DEFAULT 0' },
  { name: 'business_name', type: 'TEXT' },
  { name: 'business_type', type: 'TEXT' },
  { name: 'business_address', type: 'TEXT' },
];

let completed = 0;

columns.forEach(col => {
  db.run(`ALTER TABLE residents ADD COLUMN ${col.name} ${col.type}`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log(`Column ${col.name} already exists`);
      } else {
        console.error(`Error adding column ${col.name}:`, err.message);
      }
    } else {
      console.log(`Added column: ${col.name}`);
    }
    
    completed++;
    if (completed === columns.length) {
      console.log('\nMigration complete!');
      db.close();
    }
  });
});
