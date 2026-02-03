# Employee Management System - Complete Technical Guide

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Project Architecture](#project-architecture)
5. [User Roles & Permissions](#user-roles--permissions)
6. [Authentication System](#authentication-system)
7. [Admin Panel Guide](#admin-panel-guide)
8. [Employee Panel Guide](#employee-panel-guide)
9. [API Reference](#api-reference)
10. [Data Models](#data-models)
11. [Security Features](#security-features)
12. [Error Handling](#error-handling)
13. [Troubleshooting](#troubleshooting)

---

## Introduction

The Employee Management System is a full-featured web application designed to manage company employees and track attendance. It provides separate dashboards for administrators and employees with role-based access control.

### Key Features

- **Admin Panel**: Manage employees, view attendance reports, generate summaries
- **Employee Portal**: Daily check-in, view profile, manage electronic signature
- **Attendance Tracking**: Daily check-ins with time window restrictions
- **Electronic Signatures**: Draw or upload signatures
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## System Requirements

### Prerequisites

| Requirement    | Minimum Version                        |
| -------------- | -------------------------------------- |
| Node.js        | v18.0.0 or higher                      |
| npm            | v9.0.0 or higher                       |
| Angular CLI    | v21.0.0 or higher                      |
| Modern Browser | Chrome, Firefox, Safari, Edge (latest) |

### Backend API

The application requires a backend API server running at:

- **Default URL**: `http://157.90.107.101:5065`
- This can be configured in `src/app/core/constants/api.constants.ts`

---

## Installation Guide

### Step 1: Clone or Download the Project

```bash
# If using git
git clone <repository-url>
cd employee-management

# Or navigate to the project directory if already downloaded
cd employee-management
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:

- Angular 21.1.0 (Core, Router, Forms, HTTP)
- Bootstrap 5.3.3 (UI Framework)
- RxJS 7.8.0 (Reactive Extensions)
- TypeScript 5.9.2

### Step 3: Configure API URL (Optional)

If your backend API is hosted at a different URL, update the configuration:

**File**: `src/app/core/constants/api.constants.ts`

```typescript
export const API_BASE_URL = 'http://your-api-server:port';
```

### Step 4: Run the Application

```bash
# Development mode
npm start

# Or using Angular CLI directly
ng serve
```

The application will be available at: **http://localhost:4200**

### Step 5: Build for Production

```bash
npm run build
```

Production files will be generated in the `dist/` folder.

---

## Project Architecture

### Folder Structure

```
src/
├── app/
│   ├── core/                      # Core application modules
│   │   ├── constants/             # API endpoints configuration
│   │   │   └── api.constants.ts
│   │   ├── guards/                # Route protection guards
│   │   │   ├── admin.guard.ts     # Admin-only routes
│   │   │   ├── auth.guard.ts      # Authenticated routes
│   │   │   ├── employee.guard.ts  # Employee-only routes
│   │   │   └── guest.guard.ts     # Login page (guests only)
│   │   ├── interceptors/          # HTTP interceptors
│   │   │   └── auth.interceptor.ts
│   │   ├── models/                # TypeScript interfaces
│   │   │   ├── attendance.model.ts
│   │   │   ├── employee.model.ts
│   │   │   └── user.model.ts
│   │   └── services/              # Business logic services
│   │       ├── attendance.service.ts
│   │       ├── auth.service.ts
│   │       ├── cookie.service.ts
│   │       ├── employee.service.ts
│   │       └── toast.service.ts
│   ├── features/                  # Feature modules
│   │   ├── admin/                 # Admin features
│   │   │   ├── dashboard/
│   │   │   ├── employees/
│   │   │   ├── daily-attendance/
│   │   │   └── summaries/
│   │   ├── auth/                  # Authentication
│   │   │   └── login/
│   │   ├── employee/              # Employee features
│   │   │   ├── dashboard/
│   │   │   ├── check-ins/
│   │   │   └── profile/
│   │   ├── not-found/            # 404 page
│   │   └── unauthorized/         # 403 page
│   ├── shared/                    # Shared components
│   │   └── components/
│   │       ├── navbar/
│   │       ├── signature/
│   │       └── toast/
│   ├── app.routes.ts             # Route definitions
│   ├── app.ts                    # Root component
│   └── app.config.ts             # App configuration
├── index.html                     # Main HTML file
├── main.ts                       # Application entry point
└── styles.css                    # Global styles
```

### Technology Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| Frontend Framework | Angular 21                 |
| UI Framework       | Bootstrap 5.3.3            |
| State Management   | RxJS Observables + Signals |
| Forms              | Angular Reactive Forms     |
| HTTP Client        | Angular HttpClient         |
| Routing            | Angular Router             |
| Authentication     | JWT (JSON Web Tokens)      |

---

## User Roles & Permissions

### Admin Role

| Permission            | Description                               |
| --------------------- | ----------------------------------------- |
| View Dashboard        | Access admin dashboard with statistics    |
| Manage Employees      | Add, edit, delete employees               |
| View Employee List    | See all employees with pagination/sorting |
| View Daily Attendance | See who checked in on any date            |
| View Summaries        | Weekly attendance summaries               |
| Upload Signatures     | Update employee signatures                |

### Employee Role

| Permission            | Description                         |
| --------------------- | ----------------------------------- |
| View Dashboard        | Personal dashboard with check-in    |
| Daily Check-In        | Check in during allowed time window |
| View Profile          | See personal information            |
| Manage Signature      | Draw or upload electronic signature |
| View Check-In History | See past check-in records           |

---

## Authentication System

### Login Process

1. User enters username and password
2. Credentials sent to `POST /api/auth/login`
3. Server validates and returns JWT token + user data
4. Token stored in cookies (7-day expiration)
5. User data stored in localStorage
6. User redirected based on role (Admin or Employee)

### Token Management

- **Storage**: HTTP-only cookies
- **Expiration**: 7 days
- **Auto-logout**: On token expiration
- **Injection**: Via HTTP interceptor to all API requests

### Route Protection

| Guard           | Purpose                                            |
| --------------- | -------------------------------------------------- |
| `authGuard`     | Ensures user is logged in                          |
| `adminGuard`    | Ensures user has Admin role                        |
| `employeeGuard` | Ensures user has Employee role                     |
| `guestGuard`    | Prevents logged-in users from accessing login page |

---

## Admin Panel Guide

### Navigation Bar (Admin)

When logged in as Admin, the navigation shows:

| Menu Item            | Route                     | Description                 |
| -------------------- | ------------------------- | --------------------------- |
| Dashboard            | `/admin/dashboard`        | Main admin overview         |
| Employees            | `/admin/employees`        | Employee management         |
| Summaries            | `/admin/summaries`        | Weekly attendance summaries |
| Daily Attendance     | `/admin/daily-attendance` | Daily check-in records      |
| User Menu (dropdown) | -                         | Logout option               |

---

### Admin Dashboard (`/admin/dashboard`)

#### Overview

The main landing page for administrators showing key statistics and quick actions.

#### Components

**1. Total Employees Card**

- **Type**: Statistics card (blue)
- **Content**: Displays total number of registered employees
- **Data Source**: Fetched from `GET /api/employees`

**2. Quick Actions Section**

| Button               | Action                       | Route              |
| -------------------- | ---------------------------- | ------------------ |
| **Manage Employees** | Navigate to employee list    | `/admin/employees` |
| **View Summaries**   | Navigate to weekly summaries | `/admin/summaries` |

---

### Employee List (`/admin/employees`)

#### Overview

Full employee management interface with CRUD operations.

#### Header Section

| Element                       | Function                           |
| ----------------------------- | ---------------------------------- |
| **Page Title**                | "Employee Management"              |
| **Add New Employee** (Button) | Navigate to employee creation form |

#### Search & Filter Card

| Element                | Function                              |
| ---------------------- | ------------------------------------- |
| **Search Input**       | Search by name, phone, or national ID |
| **Page Size Dropdown** | Select items per page (5, 10, 25, 50) |

**Search Behavior**:

- Debounced input (waits for typing to stop)
- Press Enter for immediate search
- Searches across: firstName, lastName, phoneNumber, nationalId

#### Employee Table

| Column      | Sortable           | Content                               |
| ----------- | ------------------ | ------------------------------------- |
| Name        | Yes (click header) | First + Last name                     |
| Phone       | Yes                | Phone number                          |
| National ID | Yes                | 14-digit national ID                  |
| Age         | Yes                | Employee age                          |
| Signature   | No                 | Badge: "Yes" (green) or "No" (yellow) |
| Actions     | No                 | Action buttons                        |

**Sort Behavior**: Click column header to sort. Click again to reverse order.

#### Action Buttons (per row)

| Button     | Style             | Function                                   |
| ---------- | ----------------- | ------------------------------------------ |
| **Hours**  | Outline Secondary | Opens modal showing hours worked last week |
| **Edit**   | Outline Primary   | Navigate to edit form                      |
| **Delete** | Outline Danger    | Opens delete confirmation modal            |

#### Hours Modal

**Trigger**: Click "Hours" button on any employee row

| Element       | Description                       |
| ------------- | --------------------------------- |
| Header        | "Hours Worked (Last Week)"        |
| Employee Name | Bold display of selected employee |
| Hours Display | Total hours in last 7 days        |
| Close Button  | Dismiss modal                     |

#### Delete Modal

**Trigger**: Click "Delete" button on any employee row

| Element       | Description                               |
| ------------- | ----------------------------------------- |
| Header        | "Delete Employee"                         |
| Confirmation  | "Are you sure you want to delete [Name]?" |
| Warning       | "This action cannot be undone."           |
| Cancel Button | Dismiss modal                             |
| Delete Button | Confirm deletion (red)                    |

#### Pagination

| Element          | Function                                     |
| ---------------- | -------------------------------------------- |
| **Previous**     | Go to previous page (disabled on first page) |
| **Page Numbers** | Jump to specific page                        |
| **Next**         | Go to next page (disabled on last page)      |

---

### Add/Edit Employee Form (`/admin/employees/add` or `/admin/employees/edit/:id`)

#### Form Fields

| Field            | Type     | Required              | Validation Rules                   |
| ---------------- | -------- | --------------------- | ---------------------------------- |
| **User Name**    | Text     | Yes                   | Min 2 characters                   |
| **First Name**   | Text     | Yes                   | Min 2 characters                   |
| **Last Name**    | Text     | Yes                   | Min 2 characters                   |
| **Phone Number** | Tel      | Yes                   | Valid phone format                 |
| **National ID**  | Text     | Yes                   | Exactly 14 digits, numbers only    |
| **Age**          | Number   | Yes                   | Between 18-100                     |
| **Password**     | Password | Yes (Add) / No (Edit) | Min 8 chars, uppercase + lowercase |

#### Form Buttons

| Button                                    | Function                | When Enabled       |
| ----------------------------------------- | ----------------------- | ------------------ |
| **Create Employee** / **Update Employee** | Submit form             | When form is valid |
| **Cancel**                                | Return to employee list | Always             |

#### Signature Section (Edit Mode Only)

**Displayed when**: Editing existing employee

| Element                     | Function                            |
| --------------------------- | ----------------------------------- |
| **Current Signature**       | Display existing signature image    |
| **Signature Canvas**        | Draw new signature with mouse/touch |
| **Clear Button**            | Clear drawn signature               |
| **Upload Image Button**     | Upload signature image file         |
| **Upload Signature Button** | Save signature to server            |

---

### Weekly Summaries (`/admin/summaries`)

#### Date Picker Card

| Element        | Function                                  |
| -------------- | ----------------------------------------- |
| **Date Input** | Select any date to see its week's summary |
| **Week Label** | Shows selected week range (Mon-Sun)       |

**Behavior**: Selecting a date shows the week containing that date.

#### Summary Card

| Metric            | Description                       |
| ----------------- | --------------------------------- |
| **Total Hours**   | Sum of working hours for the week |
| **Days Attended** | Number of days with check-ins     |

#### Weekly Records Table

| Column        | Content                            |
| ------------- | ---------------------------------- |
| Week          | Date range (Week Start - Week End) |
| Days Attended | Count of days                      |
| Hours         | Total hours worked                 |

---

### Daily Attendance (`/admin/daily-attendance`)

#### Date Picker Card

| Element        | Function                      |
| -------------- | ----------------------------- |
| **Date Input** | Select date to view check-ins |

#### Check-ins Table

| Column        | Content           |
| ------------- | ----------------- |
| #             | Row number        |
| Employee Name | First + Last name |
| Check-in Time | Time of check-in  |

**Empty State**: "No check-ins for this day."

---

## Employee Panel Guide

### Navigation Bar (Employee)

When logged in as Employee, the navigation shows:

| Menu Item            | Route                 | Description          |
| -------------------- | --------------------- | -------------------- |
| Dashboard            | `/employee/dashboard` | Check-in page        |
| My Check-ins         | `/employee/check-ins` | Check-in history     |
| Profile              | `/employee/profile`   | Personal information |
| User Menu (dropdown) | -                     | Logout option        |

---

### Employee Dashboard (`/employee/dashboard`)

#### Overview

Main page for employees to perform daily check-in.

#### Components

**1. Welcome Message**

- Displays: "Welcome, [First Name] [Last Name]!"

**2. Current Time Display**

- **Large Time**: Current time (updates every second)
- **Date**: Full date display

**3. Check-In Window Warning**

- **When visible**: Outside 7:30 AM - 9:00 AM
- **Message**: "Check-in window has closed. Check-in is only available between 7:30 AM and 9:00 AM."

**4. Check In Button**

- **Style**: Large primary button
- **States**:
  - Enabled: Within check-in window (7:30 AM - 9:00 AM)
  - Disabled: Outside window or currently processing
  - Loading: Shows spinner during API call

**5. Check-In Notes**

- Check-in Window: 7:30 AM - 9:00 AM
- One check-in per day limit

---

### Check-In History (`/employee/check-ins`)

#### Overview

Lists all previous check-ins for the logged-in employee.

#### Components

**1. Page Title**: "Last check-in times"

**2. Check-In List**

- Displays each check-in as a list item
- Shows: Date/time of check-in + Record ID badge
- Sorted by most recent first

**3. Empty State**: "No check-in history yet."

**4. Error State**:

- Shows error message
- Retry button to reload data

---

### Employee Profile (`/employee/profile`)

#### Overview

Displays and manages employee personal information.

#### Personal Information Card

| Field        | Display   |
| ------------ | --------- |
| First Name   | Read-only |
| Last Name    | Read-only |
| Phone Number | Read-only |
| National ID  | Read-only |
| Age          | Read-only |

#### Electronic Signature Card

**1. Current Signature Display**

- Shows existing signature image (if any)
- Message: "Signature already exists. You can update it below."
- Or: "No signature found. Please add your signature."

**2. Signature Canvas**

- Draw signature with mouse or touch
- Touch-enabled for mobile devices

**3. Action Buttons**

| Button                    | Style           | Function          |
| ------------------------- | --------------- | ----------------- |
| **Clear**                 | Outline Danger  | Clear canvas      |
| **Upload Image**          | Outline Primary | Select image file |
| **Save/Update Signature** | Primary         | Upload to server  |

---

## API Reference

### Base URL

```
http://157.90.107.101:5065
```

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "userName": "string",
  "password": "string"
}

Response:
{
  "token": "jwt-token-string",
  "firstName": "string",
  "lastName": "string",
  "nationalId": "string",
  "phoneNumber": "string",
  "age": number,
  "role": "Admin" | "Employee",
  "electronicSignature": "string" (optional)
}
```

### Employees

#### Get All Employees (Paginated)

```http
GET /api/employees?search=&sortBy=&ascending=&page=&pagesize=
Authorization: Bearer {token}

Response:
{
  "data": [Employee],
  "isNextPage": boolean,
  "page": number,
  "total": number
}
```

#### Get Employee by ID

```http
GET /api/employees/{id}
Authorization: Bearer {token}

Response: Employee object
```

#### Create Employee

```http
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "userName": "string",
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "nationalId": "string",
  "age": number,
  "password": "string"
}
```

#### Update Employee

```http
PUT /api/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "userName": "string" (optional),
  "firstName": "string" (optional),
  "lastName": "string" (optional),
  "phoneNumber": "string" (optional),
  "nationalId": "string" (optional),
  "age": number (optional),
  "password": "string" (optional)
}
```

#### Delete Employee

```http
DELETE /api/employees/{id}
Authorization: Bearer {token}
```

#### Upload Signature

```http
POST /api/employees/{id}/signature
Authorization: Bearer {token}
Content-Type: multipart/form-data

FormData: file (image file)
```

### Attendance

#### Check In

```http
POST /api/attendance/check-in
Authorization: Bearer {token}
Content-Type: application/json

{
  "employeeId": "string" (nationalId)
}

Response:
{
  "success": boolean,
  "message": "string",
  "attendance": Attendance (optional)
}
```

#### Get Attendance History

```http
GET /api/attendance/history
Authorization: Bearer {token}

Response: [AttendanceHistoryItem]
```

#### Get Daily Attendance

```http
GET /api/attendance/daily?date=YYYY-MM-DD
Authorization: Bearer {token}

Response: [DailyAttendanceItem]
```

#### Get Weekly Attendance

```http
GET /api/attendance/weekly?weekStart=YYYY-MM-DD
Authorization: Bearer {token}

Response: [WeeklyAttendanceItem]
```

---

## Data Models

### User

```typescript
interface User {
  age: number;
  electronicSignature?: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phoneNumber: string;
  role: 'Admin' | 'Employee';
  token?: string;
}
```

### Employee

```typescript
interface Employee {
  id?: string;
  userName?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationalId?: string;
  nationalId?: string;
  age: number;
  electronicSignature?: string;
  email?: string;
}
```

### Attendance

```typescript
interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  checkInTime: string;
  checkInDate: string;
  workingHours?: number;
}
```

### WeeklyAttendanceItem

```typescript
interface WeeklyAttendanceItem {
  weekStart: string;
  weekEnd: string;
  daysAttended: number;
  totalHours: number;
}
```

---

## Security Features

### Authentication Flow

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│  User   │──────│  Login   │──────│   API   │
│         │      │   Page   │      │ Server  │
└─────────┘      └──────────┘      └─────────┘
     │                │                  │
     │  1. Enter      │                  │
     │  credentials   │                  │
     │───────────────>│                  │
     │                │  2. POST /login  │
     │                │─────────────────>│
     │                │                  │
     │                │  3. JWT Token    │
     │                │<─────────────────│
     │                │                  │
     │                │  4. Store token  │
     │                │  in cookie       │
     │                │                  │
     │  5. Redirect   │                  │
     │<───────────────│                  │
```

### Token Injection (HTTP Interceptor)

All HTTP requests automatically include the JWT token:

```typescript
Authorization: Bearer<token>;
```

### Route Guards

```
┌─────────────────────────────────────────────────────────┐
│                     Application Routes                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  /login ──────► guestGuard ──► (logged in? redirect)   │
│                                                         │
│  /admin/* ────► authGuard ──► adminGuard               │
│                   ▼              ▼                      │
│              (logged in?)   (is Admin?)                 │
│                                                         │
│  /employee/* ─► authGuard ──► employeeGuard            │
│                   ▼              ▼                      │
│              (logged in?)   (is Employee?)             │
│                                                         │
│  /unauthorized ─► No guard (error page)                │
│  /** (404) ─────► No guard (not found page)            │
└─────────────────────────────────────────────────────────┘
```

### Password Requirements

| Requirement    | Rule                        |
| -------------- | --------------------------- |
| Minimum Length | 8 characters                |
| Uppercase      | At least 1 uppercase letter |
| Lowercase      | At least 1 lowercase letter |

### Session Management

- **Token Storage**: Secure HTTP-only cookie
- **Token Expiration**: 7 days
- **Auto-logout**: When token expires
- **Manual Logout**: Clears cookie and localStorage

---

## Error Handling

### Toast Notifications

The application uses toast notifications for user feedback:

| Type    | Color  | Usage                 |
| ------- | ------ | --------------------- |
| Success | Green  | Successful operations |
| Error   | Red    | Failed operations     |
| Warning | Yellow | Warnings              |
| Info    | Blue   | Information           |

### Form Validation Errors

Displayed inline below each invalid field:

| Field       | Error Messages                                                 |
| ----------- | -------------------------------------------------------------- |
| User Name   | "User name is required", "Min 2 characters"                    |
| Password    | "Password is required", "Min 8 chars with uppercase/lowercase" |
| National ID | "Required", "Must be 14 digits", "Numbers only"                |
| Age         | "Required", "Must be 18-100"                                   |
| Phone       | "Required", "Invalid format"                                   |

### API Error Handling

```typescript
// Errors are caught and displayed via toast
error: (error) => {
  const message = error.error?.message || 'Operation failed';
  this.toastService.error(message);
};
```

---

## Troubleshooting

### Common Issues

#### 1. Cannot Login

- **Check**: API server is running
- **Check**: Correct API URL in `api.constants.ts`
- **Check**: Valid credentials

#### 2. Check-In Button Disabled

- **Reason**: Outside check-in window (7:30 AM - 9:00 AM)
- **Reason**: Already checked in today

#### 3. Signature Upload Fails

- **Check**: Image file format (JPEG, PNG supported)
- **Check**: File size (should be reasonable)
- **Check**: Canvas is not empty before upload

#### 4. Employee List Empty

- **Check**: API server connection
- **Check**: User has Admin role
- **Check**: Network tab for API errors

#### 5. Page Shows "Unauthorized"

- **Reason**: Accessing route without proper role
- **Solution**: Login with correct account type

### Browser Console Errors

| Error            | Solution                               |
| ---------------- | -------------------------------------- |
| CORS Error       | Backend needs to allow frontend origin |
| 401 Unauthorized | Re-login, token expired                |
| 404 Not Found    | Check API endpoint URL                 |
| Network Error    | Check API server availability          |

### Clearing Application State

If experiencing issues, clear stored data:

```javascript
// In browser console
localStorage.clear();
document.cookie.split(';').forEach(function (c) {
  document.cookie = c
    .replace(/^ +/, '')
    .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
});
location.reload();
```

---

## Quick Reference

### Keyboard Shortcuts

| Context      | Shortcut | Action                |
| ------------ | -------- | --------------------- |
| Search Input | Enter    | Trigger search        |
| Forms        | Tab      | Navigate fields       |
| Modals       | Escape   | Close (click outside) |

### Important URLs

| Environment | URL                        |
| ----------- | -------------------------- |
| Development | http://localhost:4200      |
| API Server  | http://157.90.107.101:5065 |

### NPM Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm start`     | Start development server |
| `npm run build` | Build for production     |
| `npm test`      | Run unit tests           |
| `npm run watch` | Build with watch mode    |

---

## Support

For technical issues or questions, refer to:

- This documentation
- Angular official documentation: https://angular.dev
- Bootstrap documentation: https://getbootstrap.com/docs

---
