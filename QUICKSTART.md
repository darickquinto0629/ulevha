# Quick Start Guide - Ulevha System

## Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org))
- **npm** v6+ (comes with Node.js)
- **Port 3000** (Backend API)
- **Port 5173** (Frontend)

## Initial Setup (First Time Only)

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database with Demo Users
```bash
npm run seed
```

This creates:
- **Admin** account: `admin@example.com` / `password`
- **Staff** account: `staff@example.com` / `password`

### 3. Validate Setup (Optional)
```bash
node validate.js
```

This checks:
- ✓ Node.js version
- ✓ Required files
- ✓ Environment variables
- ✓ Database setup
- ✓ npm packages
- ✓ Port availability
- ✓ Directory permissions

## Running the Application

### Option 1: Run Everything Together (Recommended)
```bash
npm run dev
```

This starts:
- **Frontend** (Vite): `http://127.0.0.1:5173`
- **Backend** (Express): `http://127.0.0.1:3000`

Output should show:
```
[webpack] Compiled successfully
🚀 Ulevha API Server Started
```

### Option 2: Run Separately (For Debugging)
```bash
# Terminal 1: Start Backend
npm run dev:backend

# Terminal 2: Start Frontend
npm run dev:frontend
```

### Option 3: Production Mode
```bash
# Build frontend
npm run build

# Start backend (serves frontend as static files)
npm run start
```

## How to Login

1. Open browser: `http://127.0.0.1:5173`
2. You should see the **Login Page**
3. Choose credentials:
   - **Admin**: `admin@example.com` / `password`
   - **Staff**: `staff@example.com` / `password`
4. Click **Login**
5. You'll be redirected to your dashboard

## API Documentation

### Health Check
```bash
curl http://127.0.0.1:3000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Ulevha API is running",
  "timestamp": "2026-02-13T10:00:00.000Z"
}
```

### Login
```bash
curl -X POST http://127.0.0.1:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

## Troubleshooting

### Issue: "NetworkError when attempting to fetch resource"

**Solution**: Make sure backend is running
```bash
# Check if backend is running
curl http://127.0.0.1:3000/api/health

# Response: {"success":true,"message":"Ulevha API is running"}

# If no response, start backend:
npm run dev:backend
```

### Issue: "Port 5173 is already in use"

**Solution**: Kill the process on that port
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 5174
```

### Issue: "Port 3000 is already in use"

**Solution**: Kill the process on that port
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

### Issue: "Cannot find module 'sqlite3'"

**Solution**: Reinstall dependencies
```bash
rm -rf node_modules package-lock.json
npm install
npm run seed
```

### Issue: Database locked

**Solution**: Restart the application
```bash
# Make sure no processes are running
taskkill /F /IM node.exe

# Clean up
rm -f backend/database/ulevha.db

# Start fresh
npm run seed
npm run dev
```

## Project Structure

```
ulevha/
├── src/                          # Frontend source
│   ├── components/
│   │   ├── ui/                   # shadcn UI components
│   │   └── ProtectedRoute.jsx    # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx       # Auth state
│   ├── hooks/
│   │   └── useAuth.js            # Auth hook
│   ├── lib/
│   │   └── apiConfig.js          # API configuration
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── StaffDashboard.jsx
│   └── App.jsx                   # Main app
├── backend/                      # Backend source
│   ├── database/
│   │   └── db.js                 # SQLite setup
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js               # Auth middleware
│   └── routes/
│       ├── authRoutes.js
│       └── userRoutes.js
├── server.js                     # Express server
├── seed.js                       # Database seeding
├── .env                          # Environment variables
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
```

## Environment Variables

File: `.env`

```env
PORT=3000                              # Backend port
NODE_ENV=development                   # Environment
JWT_SECRET=your_super_secret...       # JWT secret (change in production!)
JWT_EXPIRE=24h                        # Token expiration
DATABASE_PATH=./backend/database/ulevha.db  # Database location
```

## Available Routes

### Public Routes
- `/login` - Login page

### Admin Routes (requires admin role)
- `/admin/dashboard` - Admin dashboard

### Staff Routes (requires staff role)
- `/staff/dashboard` - Staff dashboard

## Available Scripts

```bash
# Development
npm run dev              # Start frontend + backend
npm run dev:frontend    # Frontend only (Vite)
npm run dev:backend     # Backend only (Express)

# Production
npm run build           # Build frontend
npm run start           # Start backend server
npm run preview         # Preview production build

# Utilities
npm run seed            # Seed demo users
npm run lint            # Check code style
node validate.js        # Validate setup
```

## Testing in Browser

### 1. Open DevTools (F12)
### 2. Go to Network Tab
### 3. Login through the app
### 4. You should see:
   - Request: `POST /api/auth/login`
   - Status: `200`
   - Response includes JWT token

### 5. Check Console Tab
   - `[API Config] Environment: development`
   - `[API Config] API URL: http://localhost:3000/api`
   - `[API] POST /auth/login`
   - `[API] ✓ POST /auth/login - Success`

## Next Steps

After successful setup:

1. **Explore Admin Dashboard**
   - View user management options
   - Check system settings

2. **Explore Staff Dashboard**
   - View resident management
   - Check available actions

3. **Create More Users**
   - Login as admin
   - Create additional staff/admin accounts

4. **Build Features**
   - User management interface
   - Analytics dashboard
   - Settings pages

## Documentation

- **[API.md](API.md)** - Complete API documentation
- **[NETWORK_CONFIG.md](NETWORK_CONFIG.md)** - Network configuration & troubleshooting
- **[SHADCN_GUIDE.md](SHADCN_GUIDE.md)** - UI component guide
- **[AUTH_SETUP_GUIDE.md](AUTH_SETUP_GUIDE.md)** - Authentication details

## Support

If you encounter issues:

1. Check **console output** for error messages
2. Open **DevTools (F12)** → **Console** tab
3. Check **Network** tab for failed requests
4. Review **[NETWORK_CONFIG.md](NETWORK_CONFIG.md)** for troubleshooting
5. Run **`node validate.js`** to check setup

---

**Status**: ✅ Ready to use  
**Last Updated**: February 13, 2026
