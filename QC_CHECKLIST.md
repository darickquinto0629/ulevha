# Quality Control Checklist - Ulevha

**Generated:** March 2, 2026

---

## ✅ CRITICAL (FIXED)

| # | Issue | Location | Status |
|---|-------|----------|--------|
| 1 | Hardcoded JWT secret fallback `'your_secret_key'` | backend/middleware/auth.js:3, backend/controllers/authController.js:5 | ✅ Fixed - throws error if env not set |
| 2 | Public `/register` endpoint without admin approval | backend/routes/authRoutes.js:7 | ✅ Fixed - requires admin auth |
| 3 | User can change their own role via API | backend/controllers/userController.js:206 | ✅ Fixed - update requires admin role |
| 4 | No check prevents staff from escalating role to admin | backend/routes/userRoutes.js:19 | ✅ Fixed - only admins can update users |

---

## 🟠 HIGH PRIORITY

| # | Issue | Location |
|---|-------|----------|
| 5 | Demo credentials displayed on login page | src/pages/LoginPage.jsx:136-148 |
| 6 | No rate limiting on auth endpoints | server.js |
| 7 | 11+ console.log statements exposing auth flow | src/contexts/AuthContext.jsx, src/lib/apiConfig.js:31 |
| 8 | JSON.parse on card_types can throw if malformed | src/components/ResidentList.jsx:164 |
| 9 | Debug console.logs in backend controller | backend/controllers/residentController.js:288-293 |

---

## 🟡 MEDIUM PRIORITY

| # | Issue | Location |
|---|-------|----------|
| 10 | Update doesn't clear fields to null (uses COALESCE) | backend/controllers/residentController.js:306-335 |
| 11 | No email format validation on backend | backend/controllers/authController.js:106 |
| 12 | No password length validation on backend | backend/controllers/authController.js:106 |
| 13 | Typo: "Turmaline" should be "Tourmaline" | src/components/ResidentForm.jsx:168, src/pages/ResidentManagement.jsx:255 |
| 14 | Pagination disabled state wrong when pages=0 | src/components/ResidentList.jsx:290 |
| 15 | Users can delete themselves | backend/controllers/userController.js:301 |
| 16 | Contact number not validated for format | src/components/ResidentForm.jsx |

---

## 🟢 LOW PRIORITY

| # | Issue | Location |
|---|-------|----------|
| 17 | Inconsistent field names: `phone` vs `contact_number` | backend/database/db.js |
| 18 | Gender "Other" not handled in dashboard stats | src/pages/AdminDashboard.jsx:51 |
| 19 | PhilSys Number not shown in resident list or export | src/components/ResidentList.jsx |
| 20 | No loading state when deleting | src/components/ResidentList.jsx, src/pages/UserManagement.jsx |
| 21 | Resident ID format breaks after 999 (RES-1000) | backend/controllers/residentController.js:208 |
| 22 | No confirmation before leaving unsaved form | src/components/ResidentForm.jsx |

---

## 📋 MISSING FEATURES

| # | Feature |
|---|---------|
| 23 | Password reset functionality |
| 24 | Audit log viewing UI |
| 25 | Rate limiting middleware |

---

## Summary

| Priority | Count |
|----------|-------|
| 🔴 Critical | 4 |
| 🟠 High | 5 |
| 🟡 Medium | 7 |
| 🟢 Low | 6 |
| 📋 Missing Features | 3 |
| **Total** | **25** |

---

## Detailed Descriptions

### Critical Issues

**#1 - Hardcoded JWT Secret**
- Files: `backend/middleware/auth.js`, `backend/controllers/authController.js`
- The code uses `process.env.JWT_SECRET || 'your_secret_key'` which means if the environment variable is not set, a weak hardcoded secret is used. This is a major security vulnerability in production.

**#2 - Public Registration Endpoint**
- File: `backend/routes/authRoutes.js`
- The `/register` endpoint is publicly accessible without any authentication. Anyone can create accounts without admin approval.

**#3 & #4 - Role Escalation Vulnerability**
- Files: `backend/controllers/userController.js`, `backend/routes/userRoutes.js`
- Users can potentially modify their own role or escalate privileges through the API.

### High Priority Issues

**#5 - Demo Credentials in Production**
- File: `src/pages/LoginPage.jsx`
- Demo login credentials are displayed on the login page. Should only show in development mode.

**#6 - No Rate Limiting**
- File: `server.js`
- No rate limiting middleware is implemented, making the app vulnerable to brute force attacks.

**#7 - Console.log Statements**
- Files: `src/contexts/AuthContext.jsx`, `src/lib/apiConfig.js`
- Multiple debug console.log statements that expose authentication flow details and should be removed for production.

**#8 - JSON Parse Error**
- File: `src/components/ResidentList.jsx`
- `JSON.parse(r.card_types)` can throw an exception if the data is malformed. Should wrap in try-catch.

### Medium Priority Issues

**#13 - Typo in Street Name**
- "Turmaline" should be spelled "Tourmaline"
- Affects: `ResidentForm.jsx`, `ResidentManagement.jsx`

**#14 - Pagination Edge Case**
- When total pages is 0, the "Next" button disabled logic fails
- Line: `disabled={pagination.currentPage === pagination.pages}`

### Low Priority Issues

**#19 - PhilSys Number Not Displayed**
- PhilSys Number is collected in the form but not shown in the resident list table or exported to Excel.

**#21 - Resident ID Format**
- Current format `RES-XXX` with padStart(3, '0') will produce `RES-1000` instead of `RES-1000` after 999 residents, breaking the 3-digit format.

---

## Recommended Fix Order

1. Fix Critical security issues (#1-4) first
2. Remove console.logs and demo credentials (#5, #7, #9)
3. Add error handling for JSON.parse (#8)
4. Fix validation issues (#11, #12, #16)
5. Fix typos and UI issues (#13, #14)
6. Address remaining low priority items
7. Implement missing features as time permits
