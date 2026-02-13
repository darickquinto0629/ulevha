import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'backend/database/ulevha.db');

const db = new sqlite3.Database(dbPath, async (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }

  try {
    console.log('🔄 Seeding database with demo users...\n');

    const hashedPasswordAdmin = await bcrypt.hash('password', 10);
    const hashedPasswordStaff = await bcrypt.hash('password', 10);

    db.run(
      `INSERT OR IGNORE INTO users (name, email, password, role_id, age, gender, address, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Admin User',
        'admin@example.com',
        hashedPasswordAdmin,
        1,
        45,
        'M',
        'Executive Village, House 1',
        '555-0001',
        1,
      ],
      (err) => {
        if (err) {
          console.error('Error inserting admin user:', err);
        } else {
          console.log('✓ Admin user created successfully');
          console.log('  Email: admin@example.com');
          console.log('  Password: password\n');
        }
      }
    );

    db.run(
      `INSERT OR IGNORE INTO users (name, email, password, role_id, age, gender, address, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Staff Member',
        'staff@example.com',
        hashedPasswordStaff,
        2,
        32,
        'F',
        'Executive Village, House 2',
        '555-0002',
        1,
      ],
      (err) => {
        if (err) {
          console.error('Error inserting staff user:', err);
        } else {
          console.log('✓ Staff user created successfully');
          console.log('  Email: staff@example.com');
          console.log('  Password: password\n');
        }
      }
    );

    // Close database after a short delay
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('✓ Database seeded successfully!');
          console.log('\n🎉 You can now login with the demo credentials above.');
          process.exit(0);
        }
      });
    }, 1000);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
});
