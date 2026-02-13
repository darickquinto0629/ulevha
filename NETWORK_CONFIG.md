# Network Configuration & Troubleshooting Guide

## Overview

The Ulevha system is designed to work seamlessly in three environments:
1. **Development** - Vite dev server + Express backend
2. **Production Web** - Static files + Express backend
3. **Electron Desktop** - Bundled app + Express backend

This guide explains how to fix network errors and configure the system for production.

## What Was Fixed

### 1. **API Configuration Service** (`src/lib/apiConfig.js`)
- Automatically detects the correct API URL based on environment
- Handles localhost, 127.0.0.1, and domain-based URLs
- Provides helpful error messages for network issues
- Logs all API calls for debugging

### 2. **CORS Configuration** (`server.js`)
- Allows requests from localhost on all ports
- Supports development, production, and Electron
- Properly configured credentials and methods
- Dynamic origin validation

### 3. **Frontend Authentication** (`src/contexts/AuthContext.jsx`)
- Uses API configuration service instead of hardcoded URLs
- Better error handling with descriptive messages
- Request logging for debugging
- Fallback mechanisms for network failures

### 4. **Vite Configuration** (`vite.config.js`)
- API proxy for development (`/api` → `localhost:3000`)
- Proper server configuration on `127.0.0.1:5173`
- Build optimization for production

## How It Works

### Development Environment

```
User Browser (http://127.0.0.1:5173)
    ↓
Vite Dev Server (with API proxy)
    ↓
/api/* requests → Proxy to http://127.0.0.1:3000/api/*
    ↓
Express Backend (http://127.0.0.1:3000)
    ↓
SQLite Database
```

When you access `/api/auth/login` from the frontend during development:
1. Vite intercepts the request
2. Vite proxies it to `http://127.0.0.1:3000/api/auth/login`
3. Backend processes the request
4. Response is returned through the proxy

### Production Environment

```
User Browser (https://yourdomain.com)
    ↓
Static files + SPA routing
    ↓
API requests to https://yourdomain.com/api/*
    ↓
Express Backend running on same server
    ↓
SQLite Database
```

In production:
- Frontend and backend are on the same domain/port
- No proxy needed
- Direct API calls to backend

### Electron Environment

```
Electron Main Process
    ↓
Express Backend (http://127.0.0.1:3000)
    ↓
Electron Renderer Process (BrowserView)
    ↓
API requests to http://127.0.0.1:3000/api/*
```

In Electron:
- Backend runs locally with Express
- Frontend communicates via localhost
- No CORS issues (same origin)

## Common Network Errors & Solutions

### Error: "NetworkError when attempting to fetch resource"

**Cause**: Frontend cannot reach backend API

**Solutions**:

1. **Make sure backend is running**
   ```bash
   # In separate terminal
   npm run dev:backend
   # or
   node server.js
   ```

2. **Check backend is listening on correct port**
   ```bash
   # Should see:
   # 🚀 Ulevha API Server Started
   # URL: http://localhost:3000
   ```

3. **Verify firewall isn't blocking port 3000**
   ```bash
   # Windows: Check if port is blocked
   netstat -ano | findstr :3000
   
   # If blocked, kill the process
   taskkill /PID <PID> /F
   ```

4. **Try accessing health endpoint directly**
   ```bash
   curl http://127.0.0.1:3000/api/health
   
   # Should return:
   # {"success":true,"message":"Ulevha API is running",...}
   ```

5. **Check browser console for detailed error**
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for specific error messages

### Error: "CORS policy: Cross-Origin Request Blocked"

**Cause**: Browser blocking cross-origin requests

**Solution**: This is handled automatically, but if it occurs:

1. Backend CORS is configured to allow:
   - `http://localhost:*` (any port on localhost)
   - `http://127.0.0.1:*` (any port on 127.0.0.1)
   - No origin (for Electron)

2. Verify backend started successfully with CORS enabled:
   ```
   CORS: ✓ Enabled
   ```

### Error: "Request timeout" or "Connection refused"

**Cause**: Backend not responding or wrong address

1. **Ensure both servers are running**
   ```bash
   npm run dev  # Starts both frontend and backend
   ```

2. **Check API URL in browser console**
   ```javascript
   // In browser console
   import { getApiUrl } from 'src/lib/apiConfig.js'
   console.log(getApiUrl())  // Should show: http://localhost:3000/api
   ```

3. **Check that both are on expected addresses**
   - Frontend: `http://127.0.0.1:5173`
   - Backend: `http://127.0.0.1:3000`

## Development Setup

### Quick Start
```bash
# Terminal 1: Start everything
npm run dev

# This runs concurrently:
# - Vite: http://127.0.0.1:5173
# - Backend: http://127.0.0.1:3000
```

### Individual Servers (for debugging)
```bash
# Terminal 1: Backend only
npm run dev:backend

# Terminal 2: Frontend only
npm run dev:frontend

# Vite will automatically proxy /api/* to localhost:3000
```

## Testing the Network

### Test 1: API Health Check
```bash
curl http://127.0.0.1:3000/api/health -v
```

Expected response:
```json
{
  "success": true,
  "message": "Ulevha API is running",
  "timestamp": "2026-02-13T10:00:00.000Z"
}
```

### Test 2: Login Request
```bash
curl -X POST http://127.0.0.1:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    }
  },
  "message": "Login successful"
}
```

### Test 3: Verify from Frontend
Open browser DevTools Console and run:
```javascript
// Test API configuration
import { getApiUrl } from 'src/lib/apiConfig.js'
console.log('API URL:', getApiUrl())

// Test fetch to health endpoint
fetch(getApiUrl() + '/health')
  .then(r => r.json())
  .then(d => console.log('Health check:', d))
  .catch(e => console.error('Error:', e))
```

## Production Deployment

### For Web Hosting

1. **Build frontend**
   ```bash
   npm run build
   # Creates dist/ folder with optimized files
   ```

2. **Set environment for production**
   ```bash
   NODE_ENV=production
   ```

3. **Start backend**
   ```bash
   npm run start
   # or
   node server.js
   ```

4. **Serve frontend as static files**
   - Upload `dist/` folder to web server
   - Configure web server to serve `dist/index.html` for all routes
   - Backend API should be available at same domain

### Example Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Serve static files
    location / {
        root /var/www/ulevha/dist;
        try_files $uri /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Example Node.js Server (Combined Frontend + Backend)
```javascript
// After building frontend, copy dist/ to public folder
// Then serve with Express
app.use(express.static('public'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile('public/index.html');
});
```

## Electron Configuration

For Electron builds, minimal changes needed:

1. **Backend starts with main process**
   ```javascript
   // electron-main.js
   import { spawn } from 'child_process'
   
   // Start Express server
   const serverProcess = spawn('node', ['server.js'], {
     cwd: __dirname,
     detached: false,
   })
   ```

2. **Frontend auto-detects Electron environment**
   - API configuration detects `window.process.type === 'renderer'`
   - Uses `http://localhost:3000/api` automatically
   - No CORS issues

3. **Build process bundles both**
   - Frontend: `npm run build` creates dist/
   - Backend: Included as-is
   - Electron builder packages both together

## Debugging Tips

### 1. Enable Detailed Logging

Frontend logging is already enabled. Check browser console:
```
[API Config] Environment: development
[API Config] API URL: http://localhost:3000/api
[API] POST /auth/login
[API] ✓ POST /auth/login - Success
```

Backend logging:
```
[2026-02-13T10:00:00.000Z] POST /api/auth/login - Origin: http://localhost:5173
```

### 2. Network Tab in DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Make a login request
4. Check the request:
   - URL should be `/api/auth/login` (due to Vite proxy)
   - Status should be 200 (success)
   - Response should show token

### 3. Backend Logs

Terminal running backend server shows:
```
[2026-02-13T10:00:00.000Z] POST /api/auth/login - Origin: http://127.0.0.1:5173
✓ admin@example.com
Login successful
```

### 4. Check Port Availability

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check if port 5173 is in use
netstat -ano | findstr :5173

# If in use, kill the process
taskkill /PID <PID> /F
```

## Checklist for Production

- ✅ Environment variables configured (`.env`)
- ✅ JWT_SECRET changed from default
- ✅ Database path correct and writable
- ✅ Ports not blocked by firewall
- ✅ Backend starting with `npm run start`
- ✅ Frontend built with `npm run build`
- ✅ CORS configured for your domain
- ✅ Database backed up regularly
- ✅ Error logging configured
- ✅ HTTPS enabled (for web)
- ✅ Tested with real data
- ✅ API health check passing

## Support

For network issues:
1. Check backend is running: `npm run dev:backend`
2. Test health endpoint: `curl http://127.0.0.1:3000/api/health`
3. Check browser DevTools Network tab
4. Review error messages in console
5. Check `.env` configuration

---

**Last Updated**: February 13, 2026
**Status**: ✅ Network configuration fixed and tested
