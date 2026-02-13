# Authentication System - Setup & Testing Guide

This guide will help you set up and test the authentication system for the Ulevha Database Management System.

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Seed Demo Users
```bash
node seed.js
```

This will create two demo users:
- **Admin**: admin@example.com / password
- **Staff**: staff@example.com / password

### 3. Start the Application
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers concurrently:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## System Architecture

### Frontend Components
- **LoginPage** (`src/pages/LoginPage.jsx`) - User login interface
- **AdminDashboard** (`src/pages/AdminDashboard.jsx`) - Admin control panel
- **StaffDashboard** (`src/pages/StaffDashboard.jsx`) - Staff interface
- **AuthContext** (`src/contexts/AuthContext.jsx`) - Global auth state management
- **ProtectedRoute** (`src/components/ProtectedRoute.jsx`) - Route protection component

### Backend API
- **Authentication Routes** (`/api/auth`)
  - `POST /login` - User login
  - `POST /register` - User registration
  - `GET /verify` - Token verification

- **User Routes** (`/api/users`)
  - `GET /` - List all users (Admin only)
  - `GET /:id` - Get user by ID
  - `POST /` - Create new user (Admin only)
  - `PUT /:id` - Update user
  - `DELETE /:id` - Delete user (Admin only)

### Database Schema
- **users** - User accounts and information
- **roles** - User roles (admin, staff)
- **audit_logs** - System activity tracking
- **analytics** - Demographics data

## Testing the Authentication System

### Test 1: Admin Login
1. Open http://localhost:5173/login
2. Enter:
   - Email: `admin@example.com`
   - Password: `password`
3. Click Login
4. Should redirect to Admin Dashboard

### Test 2: Staff Login
1. Go to http://localhost:5173/login
2. Enter:
   - Email: `staff@example.com`
   - Password: `password`
3. Click Login
4. Should redirect to Staff Dashboard

### Test 3: Role-Based Access
1. As Admin:
   - Can access `/admin/dashboard`
   - Cannot access `/staff/dashboard` (redirects to `/admin/dashboard`)
2. As Staff:
   - Can access `/staff/dashboard`
   - Cannot access `/admin/dashboard` (redirects to login)

### Test 4: Token Persistence
1. Login with any user
2. Refresh the page
3. Should remain logged in (token stored in localStorage)
4. Logout
5. Token should be cleared from localStorage

### Test 5: Protected Routes
1. Try accessing `/admin/dashboard` without login
2. Should redirect to `/login`
3. Try accessing `/staff/dashboard` without login
4. Should redirect to `/login`

## API Testing with curl/Postman

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR...",
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

### Verify Token
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get All Users (Admin only)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Create User (Admin only)
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "newpassword",
    "role": "staff",
    "age": 30,
    "gender": "M",
    "address": "Executive Village",
    "phone": "555-0003"
  }'
```

## Security Features Implemented

✅ **Password Hashing** - bcryptjs with salt rounds
- Passwords are hashed before storing in database
- Impossible to recover original passwords

✅ **JWT Authentication** - JSON Web Tokens
- Stateless authentication
- Token expiration (24 hours)
- Secure token storage in localStorage

✅ **Role-Based Access Control (RBAC)**
- Admin role: Full system access
- Staff role: Limited to user operations
- Middleware-based authorization

✅ **Protected Routes**
- Frontend route protection with ProtectedRoute component
- Backend route protection with middleware
- Unauthorized access redirects to login

✅ **Audit Logging**
- All authentication events logged
- User action tracking
- IP address and user agent recording

✅ **Error Handling**
- Specific error messages for debugging
- Consistent error response format
- No sensitive information in errors

## Environment Variables

Located in `.env`:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=24h
DATABASE_PATH=./backend/database/ulevha.db
```

⚠️ **Important**: Change `JWT_SECRET` in production!

## Troubleshooting

### "Cannot POST /api/auth/login"
- Ensure backend server is running: `npm run dev:backend`
- Check that API_URL in AuthContext matches your backend URL

### "CORS error"
- Backend CORS is configured to accept localhost
- For production, update CORS settings in `server.js`

### Database locked
- Make sure only one backend instance is running
- Delete `ulevha.db` and restart if corrupted

### Token expired
- User needs to login again
- Token expiration is set to 24 hours
- Can implement token refresh in future

## Next Steps

After testing the authentication system, you can:

1. **Create User Management UI**
   - Build user listing page
   - Create user edit dialog
   - Implement user deletion

2. **Build Analytics Dashboard**
   - Display age distribution chart
   - Show gender distribution
   - Add summary statistics

3. **Implement Admin Settings**
   - System configuration panel
   - User role management
   - Audit log viewer

4. **Add More Features**
   - Staff account management
   - Backup and restore
   - Import/export functionality

## Support

For issues or questions:
1. Check the API documentation in [API.md](../API.md)
2. Review code comments in source files
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**Last Updated**: February 13, 2026
