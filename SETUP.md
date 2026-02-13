# Setup Guide - Ulevha Database Management System

Complete setup instructions for different deployment scenarios.

## Table of Contents
1. [Development Setup](#development-setup)
2. [Production Setup](#production-setup)
3. [Electron Setup](#electron-setup)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites
- Node.js v14 or higher
- npm v6 or higher (or yarn)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/ulevha.git
   cd ulevha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Development Workflow

```bash
# Start Hot Module Replacement (HMR) server
npm run dev

# Run linting checks
npm run lint

# Fix linting issues
npm run lint -- --fix

# Preview production build locally
npm run build
npm run preview
```

## Production Setup

### Building for Production

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the production build**
   ```bash
   npm run preview
   ```

3. **Check output**
   - Built files will be in the `dist/` directory
   - Includes optimized and minified code
   - Ready for deployment

### Deployment

#### Option 1: Static Hosting (Vercel, Netlify, GitHub Pages)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

#### Option 2: Self-hosted Server
1. Build locally: `npm run build`
2. Upload `dist/` folder to your server
3. Configure web server to serve `dist/index.html` for all routes
4. Set up backend Node.js server separately

## Electron Setup

### Prerequisites
- All development setup requirements
- Electron builder configuration

### Building Electron Application

1. **Install Electron dependencies** (if not already installed)
   ```bash
   npm install electron electron-builder --save-dev
   ```

2. **Build Electron app for development**
   ```bash
   npm run electron-dev
   ```

3. **Build Electron app for production**
   ```bash
   npm run electron-build
   ```

4. **Packaged Application**
   - Windows: `dist_electron/Ulevha Setup xxx.exe`
   - macOS: `dist_electron/Ulevha-xxx.dmg`
   - Linux: `dist_electron/Ulevha-xxx.AppImage`

### Electron Configuration

Edit `electron-main.js` to customize:
- Window size and properties
- Application menu
- File paths for database
- Auto-update settings

## Database Setup

### SQLite Database

The application uses SQLite for data persistence.

#### Initial Setup

1. **Database files location**
   ```
   User's home directory:
   - Windows: C:\Users\[username]\AppData\Roaming\ulevha\
   - macOS: ~/Library/Application Support/ulevha/
   - Linux: ~/.config/ulevha/
   ```

2. **Automatic initialization**
   - Database tables are created automatically on first run
   - Default schema is applied
   - No manual setup required

#### Database Schema

The application creates these tables:
- `users` - User information and authentication
- `roles` - User roles (Admin, Staff)
- `audit_log` - User activity tracking
- `analytics` - Demographics data (age, gender)

#### Backup & Recovery

```bash
# Backup database
cp ~/path/to/ulevha.db ~/path/to/ulevha.backup.db

# Restore from backup
cp ~/path/to/ulevha.backup.db ~/path/to/ulevha.db
```

## Environment Variables

### Create `.env.local` file

```env
# Application
VITE_APP_TITLE=Ulevha Database Management System
VITE_APP_VERSION=0.1.0

# Backend API (if using separate backend)
VITE_API_URL=http://localhost:3000

# Database
DATABASE_PATH=./ulevha.db

# Authentication
AUTH_SECRET=your_secret_here
JWT_EXPIRY=24h

# Features
ENABLE_ANALYTICS=true
ENABLE_AUDIT_LOG=true
```

### Available Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_TITLE` | Ulevha | Application title |
| `VITE_API_URL` | http://localhost:3000 | Backend API URL |
| `DATABASE_PATH` | ./ulevha.db | SQLite database path |
| `AUTH_SECRET` | - | Secret key for authentication |
| `ENABLE_ANALYTICS` | true | Enable analytics features |
| `ENABLE_AUDIT_LOG` | true | Enable activity logging |

## Troubleshooting

### Common Issues

#### Issue: Port 5173 already in use
```bash
# Use a different port
npm run dev -- --port 3000
```

#### Issue: Node modules installation fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Database file corrupted
```bash
# Remove corrupted database
rm ~/path/to/ulevha.db

# Restart application to create new database
npm run dev
```

#### Issue: Electron app won't start
```bash
# Clear Electron cache
rm -rf node_modules/.cache

# Rebuild native modules
npm rebuild

# Try development build again
npm run electron-dev
```

#### Issue: CSS styles not loading (Tailwind)
```bash
# Rebuild Tailwind CSS
npm run build

# Or restart dev server
npm run dev
```

### Debug Mode

Enable detailed logging:

```bash
# Development
DEBUG=* npm run dev

# Electron
DEBUG=* npm run electron-dev
```

### Getting Help

1. Check [README.md](README.md) for overview
2. Review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
3. Check GitHub issues for similar problems
4. Create a new issue with detailed information

---

**Last Updated**: February 2026
