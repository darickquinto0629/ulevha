# Changelog

All notable changes to the Ulevha Database Management System project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-13

### Added

#### Business Establishments Module
- **Business Establishments Page**: New dedicated page for managing business owners
- Search and filter business owners by name, business type, or address
- View complete business details including owner information
- Accessible from both Admin and Staff dashboards

#### Database Migration System
- **Versioned Schema Migrations**: Automatic database schema updates without data loss
- Migration v1: Initial schema with all base tables
- Migration v2: Business and family columns for residents
- Migration v3: Performance indexes (9 indexes added)
- `schema_version` table tracks applied migrations
- Safe upgrade path for existing installations

#### Performance Indexes
- `idx_residents_resident_id` - Fast resident ID lookups
- `idx_residents_household` - Household number queries
- `idx_residents_active` - Active/inactive filtering
- `idx_residents_business` - Business owner queries
- `idx_residents_name` - Name-based sorting/search
- `idx_residents_address` - Street filtering
- `idx_users_email` - Email lookups
- `idx_audit_user` - Audit log user queries
- `idx_audit_action` - Audit log action filtering

#### Audit Logging
- `RESIDENT_CREATED` - Logs when residents are added
- `RESIDENT_UPDATED` - Logs when residents are modified
- `RESIDENT_DELETED` - Logs when residents are soft-deleted
- Captures user ID, IP address, user agent, and timestamp

#### Centralized Code Architecture
- **Database Helpers** (`backend/database/db.js`): Shared `dbRun`, `dbGet`, `dbAll` functions
- **Validators** (`backend/utils/validators.js`): Shared validation utilities
  - `isValidEmail()` - Email format validation
  - `calculateAge()` - Age calculation from DOB
  - `validatePassword()` - Password strength validation
  - `getAgeRangeCondition()` - SQL age filtering

#### Resident Form Enhancements
- Card types selection (Yellow, Blue, Green, PWD, Senior Citizen)
- Senior Citizen card auto-shows for residents 60+
- Business owner toggle with business details fields
- Head of family designation
- Occupation and family position fields
- Improved form validation and error handling

#### API Endpoints
- `GET /api/residents/businesses` - List business establishments with pagination

### Changed
- **Optimized Age Statistics**: SQL aggregation instead of fetching all rows (O(n) → O(1))
- **Code Deduplication**: Removed ~90 lines of duplicated DB helpers across controllers
- **Removed Debug Logs**: Cleaned up console.log statements from production code
- Dashboard charts now use optimized SQL queries
- Resident list supports card type filtering

### Fixed
- Age calculation consistency between stats and filters
- Business fields properly saved and updated
- Resident ID uniqueness validation on update

### Technical Details
- **Schema Version**: 3
- **Total Indexes**: 9 custom performance indexes
- **Audit Actions**: 3 resident-related + existing auth actions
- **Migration System**: Automatic, backward-compatible upgrades

---

## [0.3.0] - 2026-02-14

### Added

#### Dashboard Analytics
- **Resident Statistics Cards**: Display total residents, male population count, and female population count in real-time
- **Age Distribution Chart**: Interactive bar chart showing residents grouped by age ranges (0-17, 18-30, 31-45, 46-59, 60+)
- **Gender Distribution Chart**: Pie chart with percentage labels showing male/female distribution
- Charts implemented using **Recharts** library with responsive design

#### Resident Management System
- **Full CRUD Operations**: Create, Read, Update, and Delete resident records
- **Resident Form Component**: Comprehensive form with validation for:
  - Household number (unique identifier)
  - PhilSys number (optional)
  - Personal information (name, gender, date of birth)
  - Contact details and address
  - Civil status, religion, educational attainment
- **Resident List Component**: Paginated table view with search functionality
- **Auto-generated Resident ID**: System generates unique resident IDs automatically

#### API Enhancements
- `GET /api/residents` - Paginated resident list with search
- `GET /api/residents/stats` - Statistics endpoint returning total count, gender distribution, and age distribution
- `GET /api/residents/:id` - Get single resident by ID
- `POST /api/residents` - Create new resident
- `PUT /api/residents/:id` - Update existing resident
- `DELETE /api/residents/:id` - Soft delete resident (admin only)

#### Layout Components
- **AdminLayout**: Consistent layout wrapper for admin pages with navigation sidebar
- **StaffLayout**: Layout wrapper for staff pages with appropriate navigation

### Changed
- Updated `AdminDashboard` to fetch and display live statistics from API
- Updated `StaffDashboard` with identical analytics features
- Improved authentication handling - API calls now include Bearer token
- Gender codes ('M'/'F') are now properly mapped to readable labels ('Male'/'Female')

### Fixed
- Fixed dashboard not showing data due to missing authentication headers
- Fixed male/female count showing 0 by supporting both 'M'/'F' codes and full text values

### Technical Details
- **Charts Library**: Recharts v2.x
- **Database**: SQLite with residents table
- **Authentication**: JWT Bearer token required for all /residents endpoints

---

## [0.2.0] - 2026-02-13

### Added
- User authentication system with JWT tokens
- Role-based access control (Admin/Staff)
- Login page with form validation
- Protected routes based on user roles
- Auth context and hooks for state management

---

## [0.1.0] - 2026-02-13

### Added
- Initial project repository
- README with comprehensive documentation
- Contributing guidelines
- MIT License
- GitHub issue templates
- Project structure documentation

### Notes
- This is the initial release setup phase
- Core features development is in progress
