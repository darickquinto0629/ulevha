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
  
  // Test update
  db.run(
    `UPDATE residents SET is_business_owner = 1, business_name = 'TEST STORE', business_type = 'SARI-SARI', business_address = '123 TEST' WHERE id = 29`,
    function(err) {
      if (err) {
        console.error('Update error:', err);
      } else {
        console.log('Updated rows:', this.changes);
      }
      
      // Verify
      db.get('SELECT id, first_name, is_business_owner, business_name, business_type, business_address FROM residents WHERE id = 29', (err, row) => {
        if (err) console.error(err);
        else console.log('Result:', row);
        db.close();
      });
    }
  );
});
