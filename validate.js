#!/usr/bin/env node

/**
 * Validation Script - Ulevha System
 * 
 * Validates setup and diagnoses common issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`
╔═══════════════════════════════════════════════╗
║  Ulevha System - Setup Validation             ║
╚═══════════════════════════════════════════════╝
`);

let errors = [];
let warnings = [];
let info = [];

// Check 1: Node.js version
console.log('🔍 Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].slice(1));
if (majorVersion < 14) {
  errors.push(`Node.js version ${nodeVersion} is too old. Requires v14+`);
} else {
  info.push(`✓ Node.js ${nodeVersion}`);
}

// Check 2: Required files
console.log('🔍 Checking required files...');
const requiredFiles = [
  'package.json',
  'server.js',
  'src/App.jsx',
  '.env',
  'backend/database/db.js',
  'backend/controllers/authController.js',
  'backend/routes/authRoutes.js',
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${file}`);
  }
});

if (errors.filter(e => e.includes('Missing')).length === 0) {
  info.push('✓ All required files present');
}

// Check 3: .env file
console.log('🔍 Checking environment configuration...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const hasPort = envContent.includes('PORT=');
  const hasJwtSecret = envContent.includes('JWT_SECRET=');
  const hasDbPath = envContent.includes('DATABASE_PATH=');

  if (!hasPort) warnings.push('Missing PORT in .env');
  if (!hasJwtSecret) warnings.push('Missing JWT_SECRET in .env');
  if (!hasDbPath) warnings.push('Missing DATABASE_PATH in .env');

  if (hasPort && hasJwtSecret && hasDbPath) {
    info.push('✓ Environment variables configured');
  }
} else {
  errors.push('Missing .env file');
}

// Check 4: Database
console.log('🔍 Checking database...');
const dbPath = path.join(__dirname, 'backend/database/ulevha.db');
let dbExists = fs.existsSync(dbPath);
if (dbExists) {
  info.push(`✓ Database exists at ${dbPath}`);
} else {
  warnings.push('Database not yet created (will be created on first run)');
}

// Check 5: npm dependencies
console.log('🔍 Checking npm dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('node_modules not found. Run: npm install');
} else {
  const requiredPackages = [
    'express',
    'sqlite3',
    'jsonwebtoken',
    'bcryptjs',
    'react',
    'react-router-dom',
  ];

  const missingPackages = [];
  requiredPackages.forEach(pkg => {
    const pkgPath = path.join(nodeModulesPath, pkg);
    if (!fs.existsSync(pkgPath)) {
      missingPackages.push(pkg);
    }
  });

  if (missingPackages.length > 0) {
    errors.push(`Missing packages: ${missingPackages.join(', ')}`);
  } else {
    info.push('✓ All required npm packages installed');
  }
}

// Check 6: Port availability
console.log('🔍 Checking port availability...');
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port, '127.0.0.1');
  });
};

await Promise.all([3000, 5173].map(async (port) => {
  const available = await checkPort(port);
  if (!available) {
    warnings.push(`Port ${port} is already in use`);
  } else {
    info.push(`✓ Port ${port} available`);
  }
}));

// Check 7: Directory permissions
console.log('🔍 Checking directory permissions...');
try {
  const testFile = path.join(__dirname, '.permission-test');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  info.push('✓ Write permissions OK');
} catch (err) {
  errors.push(`No write permissions: ${err.message}`);
}

// Output results
console.log(`
╔═══════════════════════════════════════════════╗
║  Validation Results                            ║
╚═══════════════════════════════════════════════╝
`);

if (info.length > 0) {
  console.log('✅ OK:\n');
  info.forEach(msg => console.log(`  ${msg}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:\n');
  warnings.forEach(msg => console.log(`  ${msg}`));
  console.log();
}

if (errors.length > 0) {
  console.log('❌ Errors:\n');
  errors.forEach(msg => console.log(`  ${msg}`));
  console.log();
  console.log('💡 Fix these errors before running the application\n');
  process.exit(1);
}

// Summary
console.log(`
╔═══════════════════════════════════════════════╗
║  Ready to Start                               ║
╠═══════════════════════════════════════════════╣
║  Run: npm run dev                             ║
║                                               ║
║  Frontend: http://127.0.0.1:5173              ║
║  Backend:  http://127.0.0.1:3000              ║
║  API Docs: http://127.0.0.1:3000/api/health   ║
╚═══════════════════════════════════════════════╝
`);

process.exit(0);
