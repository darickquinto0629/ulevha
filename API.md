# API Documentation - Ulevha Database Management System

This document outlines the REST API endpoints for the Ulevha Database Management System backend (Node.js).

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-02-13T10:00:00Z"
}
```

## Authentication Endpoints

### POST `/auth/login`
User login endpoint.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin|staff"
    }
  },
  "message": "Login successful"
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `400` - Missing required fields

---

### POST `/auth/logout`
User logout endpoint.

**Headers:** Requires authentication

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### POST `/auth/refresh`
Refresh JWT token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token"
  },
  "message": "Token refreshed"
}
```

## User Management Endpoints

### GET `/users`
Get all users (Admin only).

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `role` (optional) - Filter by role (admin, staff)
- `search` (optional) - Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "staff",
        "createdAt": "2026-02-13T10:00:00Z",
        "updatedAt": "2026-02-13T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  },
  "message": "Users retrieved successfully"
}
```

---

### GET `/users/:id`
Get a specific user by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    "address": "Executive Village Address",
    "phone": "+1234567890",
    "age": 35,
    "gender": "M",
    "createdAt": "2026-02-13T10:00:00Z",
    "updatedAt": "2026-02-13T10:00:00Z"
  },
  "message": "User retrieved successfully"
}
```

---

### POST `/users`
Create a new user (Admin only).

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "staff",
  "phone": "+1234567890",
  "address": "Executive Village Address",
  "age": 30,
  "gender": "F"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_user_id",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "staff",
    "createdAt": "2026-02-13T10:00:00Z"
  },
  "message": "User created successfully"
}
```

---

### PUT `/users/:id`
Update user information (Admin or own profile).

**Request:**
```json
{
  "name": "Jane Smith",
  "phone": "+9876543210",
  "address": "New Address",
  "age": 31,
  "gender": "F"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+9876543210",
    "updatedAt": "2026-02-13T11:00:00Z"
  },
  "message": "User updated successfully"
}
```

---

### DELETE `/users/:id`
Delete a user (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Analytics Endpoints

### GET `/analytics/demographics`
Get age and gender distribution data.

**Query Parameters:**
- `year` (optional) - Filter by year
- `month` (optional) - Filter by month

**Response:**
```json
{
  "success": true,
  "data": {
    "ageDistribution": [
      {
        "ageGroup": "0-17",
        "count": 15,
        "percentage": 10.5
      },
      {
        "ageGroup": "18-30",
        "count": 35,
        "percentage": 24.5
      },
      {
        "ageGroup": "31-45",
        "count": 45,
        "percentage": 31.5
      },
      {
        "ageGroup": "46-59",
        "count": 32,
        "percentage": 22.4
      },
      {
        "ageGroup": "60+",
        "count": 16,
        "percentage": 11.2
      }
    ],
    "genderDistribution": [
      {
        "gender": "Male",
        "count": 80,
        "percentage": 56
      },
      {
        "gender": "Female",
        "count": 63,
        "percentage": 44
      }
    ],
    "totalResidents": 143
  },
  "message": "Analytics data retrieved successfully"
}
```

---

### GET `/analytics/summary`
Get overall system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 143,
    "adminUsers": 2,
    "staffUsers": 141,
    "averageAge": 41,
    "maleCount": 80,
    "femaleCount": 63,
    "usersAddedThisMonth": 5,
    "usersAddedThisYear": 20
  },
  "message": "Summary retrieved successfully"
}
```

## Admin Settings Endpoints

### GET `/admin/settings`
Get system settings (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "appName": "Ulevha",
    "appVersion": "0.1.0",
    "maxUsers": 500,
    "sessionTimeout": 3600,
    "auditLoggingEnabled": true,
    "analyticsEnabled": true
  },
  "message": "Settings retrieved successfully"
}
```

---

### PUT `/admin/settings`
Update system settings (Admin only).

**Request:**
```json
{
  "sessionTimeout": 7200,
  "auditLoggingEnabled": true,
  "analyticsEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionTimeout": 7200,
    "auditLoggingEnabled": true,
    "analyticsEnabled": true
  },
  "message": "Settings updated successfully"
}
```

---

### GET `/admin/audit-logs`
Get system audit logs (Admin only).

**Query Parameters:**
- `page` (optional) - Page number
- `limit` (optional) - Items per page
- `userId` (optional) - Filter by user
- `action` (optional) - Filter by action type
- `startDate` (optional) - Filter from date (ISO format)
- `endDate` (optional) - Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_id",
        "userId": "user_id",
        "userName": "John Doe",
        "action": "USER_CREATED",
        "details": "Created new user: jane@example.com",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "timestamp": "2026-02-13T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25
    }
  },
  "message": "Audit logs retrieved successfully"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Login failed with invalid email or password |
| `UNAUTHORIZED` | User is not authenticated |
| `FORBIDDEN` | User doesn't have permission for this action |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `DUPLICATE_EMAIL` | Email already exists |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

- 100 requests per 15 minutes per IP address
- 1000 requests per hour per authenticated user

## Pagination

All list endpoints support pagination:

```
GET /users?page=1&limit=20
```

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 143,
    "pages": 8
  }
}
```

## Sorting

Use `sort` parameter:

```
GET /users?sort=name&order=asc
GET /users?sort=createdAt&order=desc
```

---

**Last Updated**: February 2026
**API Version**: 1.0
