# Ulevha Database Management System

A comprehensive CRUD application designed for managing resident information at Executive Village Home Owners Association. This system provides role-based access control, user management, and analytics features with intuitive visualizations.

## 📋 Features

### Core Functionality
- **Resident Management** - Complete CRUD operations for resident records
- **Admin Dashboard** - Advanced settings, system configuration, and interactive analytics
- **Staff Interface** - Streamlined interface for standard user operations
- **Interactive Analytics** - Clickable charts that navigate to filtered resident lists:
  - Age distribution analysis (click to filter by age group)
  - Gender distribution visualization (click to filter by gender)
  - Street-based resident distribution (click to filter by street)
- **Smart Filtering** - Persistent filters that remember your selections across page reloads

### Resident Data Fields
- Household Number
- PhilSys Card Number
- Street (dropdown: Diamond, Ruby, Pearl, Topaz, Tourmaline, Sapphire, Emerald, Amethyst, Jade, Opal, Quartz)
- First Name, Middle Name, Last Name
- Gender, Date of Birth, Birth Place
- Contact Number, Religion
- Civil Status
- Educational Attainment

### Search & Filtering
- Text search by name, household number, resident ID, or contact
- Filter by Age Group (0-17, 18-30, 31-45, 46-59, 60+)
- Filter by Gender (Male, Female)
- Filter by Street
- Filters persist in localStorage until cleared

### User Roles
- **Admin** - Full system access including advanced settings and user management
- **Staff** - Limited access for basic CRUD operations on resident data

### Authentication
- Secure login system with role-based access control
- Session management
- User activity tracking

## 🛠️ Tech Stack

- **Frontend**: React 18+ with Vite
- **Desktop Application**: Electron
- **Backend**: Node.js
- **Database**: SQLite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Code Quality**: ESLint

## 📦 Project Structure

```
ulevha/
├── src/
│   ├── components/        # React components
│   │   ├── ResidentForm.jsx    # Resident add/edit form
│   │   ├── ResidentList.jsx    # Residents table with pagination
│   │   ├── ProtectedRoute.jsx  # Auth route protection
│   │   └── ui/                 # Reusable UI components
│   ├── pages/             # Page components
│   │   ├── AdminDashboard.jsx      # Admin analytics dashboard
│   │   ├── StaffDashboard.jsx      # Staff dashboard
│   │   ├── ResidentManagement.jsx  # Resident CRUD interface
│   │   ├── UserManagement.jsx      # User management (admin)
│   │   └── LoginPage.jsx           # Authentication page
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Layout components
│   ├── lib/               # Utility functions and API config
│   ├── assets/            # Images, icons, etc.
│   ├── App.jsx            # Main App component
│   ├── main.jsx           # Application entry point
│   ├── index.css          # Global styles
│   └── App.css            # App-level styles
├── backend/
│   ├── controllers/       # API controllers
│   ├── database/          # SQLite database
│   ├── middleware/        # Auth middleware
│   └── routes/            # API routes
├── electron/              # Electron main/preload scripts
├── public/                # Static assets
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
├── package.json           # Project dependencies and scripts
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/ulevha.git
   cd ulevha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Build Electron application**
   ```bash
   npm run electron-dev    # Development mode
   npm run electron-build  # Production build
   ```

## 🔐 User Authentication & Roles

### Admin Account
- Access to all system features
- Advanced settings configuration
- User management capabilities
- System monitoring and analytics
- Full database management

### Staff Account
- Basic CRUD operations on resident data
- View analytics dashboards
- Limited to assigned permissions
- No access to system settings

## 📊 Analytics Dashboard

The system includes interactive visual representations of resident data:

### Summary Cards (Clickable)
- **Total Residents** - Click to view all residents
- **Male Count** - Click to filter residents by male gender
- **Female Count** - Click to filter residents by female gender

### Charts (Clickable)
- **Age Demographics** - Bar chart showing age group distribution (0-17, 18-30, 31-45, 46-59, 60+)
  - Click any bar to filter residents by that age group
- **Gender Distribution** - Pie chart showing gender breakdown
  - Click any slice to filter residents by that gender
- **Residents by Street** - Bar chart showing resident count per street
  - Click any bar to filter residents by that street

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build

### Database Setup

SQLite database files are stored locally. Initial database setup will be handled automatically on first run.

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature-name`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For issues, questions, or suggestions, please open an issue on GitHub.

## 📧 Contact

For inquiries regarding this project, please contact the development team.

---

**Last Updated**: February 2026
