# Employee Management API — Tech Task Guide

A REST API for employee management with authentication, attendance tracking, and electronic signatures. Built with **ASP.NET Core**, **Entity Framework Core**, **SQL Server**, and **JWT**.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Authentication & Authorization](#authentication--authorization)
7. [Setup & Run](#setup--run)
8. [Validation & Business Rules](#validation--business-rules)
9. [Project Structure](#project-structure)

---

## Overview

The system supports:

- **Authentication**: Register and login with JWT.
- **User roles**: `Admin` and `Employee`.
- **Employee CRUD**: Admins manage employees (create, read, update, delete, list with search/sort/pagination).
- **Attendance**: Employees check in within a time window; admins view daily and weekly reports.
- **Electronic signature**: Upload and retrieve signature image per employee.

---

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Runtime     | .NET 10                              |
| Web API     | ASP.NET Core                         |
| ORM         | Entity Framework Core 10             |
| Database    | SQL Server                           |
| Auth        | ASP.NET Core Identity + JWT Bearer   |
| API docs    | OpenAPI (Swagger) in Development     |

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (e.g. Angular)                        │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP + JWT
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         ASP.NET CORE WEB API                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────┐  │
│  │   Auth      │  │  Employees  │  │  Attendance                      │  │
│  │ Controller  │  │ Controller  │  │  Controller                     │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────────┬──────────────────┘  │
│         │                │                         │                     │
│         ▼                ▼                         ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     SERVICE LAYER                                  │   │
│  │  AuthService │ EmployeeService │ AttendanceService                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                │                         │                     │
│         ▼                ▼                         ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                   REPOSITORY LAYER                                 │   │
│  │  (via Identity) │ IEmployeeRepository │ IAttendanceRepository     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│         │                │                         │                     │
│         ▼                ▼                         ▼                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  EmployeeManagementDbContext (Identity + Users + Attendances)      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SQL SERVER                                     │
│  Tables: Users (Identity), Attendances                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Layered Design

| Layer        | Responsibility |
|-------------|-----------------|
| **Controllers** | HTTP endpoints, model validation, auth attributes; delegate to services. |
| **Services**    | Business logic (e.g. check-in window, pagination, signature upload). |
| **Repositories**| Data access (EF Core); abstract `DbContext`. |
| **Entities**    | Domain models mapped to database. |
| **Models/DTOs** | Request/response and internal contracts. |

### Dependency Injection

- **DbContext**: Registered in `AddInfrastructure` (SQL Server).
- **Identity**: `AddIdentity<AppUser, IdentityRole>` with custom options.
- **JWT**: Configured in `RegisterJWTAuthentication`.
- **Repositories**: `RegisterRepositories()` — scoped.
- **Services**: `RegisterServices()` — scoped.

---

## Database Schema

### Tables

**Users** (ASP.NET Identity + custom fields)

| Column             | Type           | Notes                    |
|--------------------|----------------|--------------------------|
| Id                 | string (PK)    |                          |
| UserName           | string         | Unique, login            |
| NormalizedUserName | string         | Indexed                  |
| PasswordHash       | string         |                          |
| SecurityStamp      | string         |                          |
| ConcurrencyStamp   | string         |                          |
| Role               | string         | Default: `"Employee"`    |
| FirstName          | string (50)    | Required                 |
| LastName           | string (50)    | Required                 |
| NationalId         | string (14)    | Required, exactly 14     |
| Age                | int            | Required, 18–120        |
| PhoneNumber        | string         | Required                 |
| ElectronicSignature| string (nullable) | File path/URL       |

**Attendances**

| Column      | Type        | Notes                |
|-------------|-------------|----------------------|
| Id          | int (PK)    | Identity             |
| EmployeeId  | string (FK) | → Users.Id           |
| CheckInTime | datetime2   | Required             |

### Entity Relationship

- **User** (1) ←→ (**N**) **Attendance**: One employee many check-ins; delete user cascades attendances.

---

## API Reference

Base URL (local): `https://localhost:<port>` or `http://localhost:<port>` (see `launchSettings.json`).

### Authentication

All protected endpoints require header:

```http
Authorization: Bearer <JWT>
```

---

### 1. Auth

#### POST `/api/Auth/register`

Register a new user (no auth required).

**Request body (JSON):** `EmployeeDto`

| Field            | Type   | Required | Validation |
|------------------|--------|----------|------------|
| UserName         | string | Yes      | Min 4, unique |
| Password         | string | Yes      | Min 8, upper + lower |
| FirstName        | string | Yes      | - |
| LastName         | string | Yes      | - |
| PhoneNumber      | string | Yes      | Phone |
| NationalId       | string | Yes      | Exactly 14 digits |
| Age              | int    | Yes      | 18–120 |

**Response:** `200 OK`  
```json
{ "token": "<JWT>" }
```

**Errors:** `400` — validation or registration failure.

---

#### POST `/api/Auth/login`

Login (no auth required).

**Request body (JSON):** `LoginDto`

| Field    | Type   | Required | Validation   |
|----------|--------|----------|--------------|
| UserName | string | Yes      | Min 4        |
| Password | string | Yes      | Min 8, upper + lower |

**Response:** `200 OK` — `LoginResponseDto`  
```json
{
  "id": "string",
  "firstName": "string",
  "lastName": "string",
  "nationalId": "string",
  "age": 0,
  "phoneNumber": "string",
  "electronicSignature": "string | null",
  "role": "Admin | Employee",
  "token": "<JWT>"
}
```

**Errors:** `401` — invalid credentials.

---

### 2. Employees (Management)

All endpoints require **Admin** role unless stated.

#### POST `/api/Employees`

Create employee.

**Headers:** `Authorization: Bearer <JWT>`  
**Request body (JSON):** Same as register (`EmployeeDto`).

**Response:** `200 OK`  
```json
{ "Id": "<new-user-id>" }
```

**Errors:** `400` validation/failure, `401`/`403` unauthorized.

---

#### GET `/api/Employees`

List employees with search, sort, and pagination.

**Query parameters:**

| Parameter | Type   | Default | Description        |
|-----------|--------|--------|--------------------|
| search    | string | null   | Search filter      |
| sortBy    | string | null   | Sort field         |
| ascending | bool   | true   | Sort direction     |
| page      | int    | 1      | Page number        |
| pageSize  | int    | 10     | Items per page     |

**Response:** `200 OK` — `PaginatedResponse<GetEmployeeDto>`

```json
{
  "total": 0,
  "page": 1,
  "isNextPage": false,
  "data": [
    {
      "id": "string",
      "userName": "string",
      "firstName": "string",
      "lastName": "string",
      "phoneNumber": "string",
      "nationalId": "string",
      "electronicSignature": "string | null",
      "age": 0
    }
  ]
}
```

---

#### GET `/api/Employees/{id}`

Get employee by ID.

**Response:** `200 OK` — `GetEmployeeDto`  
**Errors:** `404` not found.

---

#### PUT `/api/Employees/{id}`

Update employee.

**Request body (JSON):** `UpdateEmployeeDto` (all fields optional except as required by validation; password optional).

**Response:** `200 OK` — full `GetEmployeeDto` of updated employee.  
**Errors:** `400` validation/failure, `404` not found.

---

#### DELETE `/api/Employees/{id}`

Delete employee (cascades attendances).

**Response:** `200 OK`  
```json
{ "message": "Deleted successfully" }
```

**Errors:** `400` delete failed, `404` not found.

---

#### GET `/api/Employees/signature`

Get current user’s electronic signature.  
**Auth:** Any authenticated user (uses `NameIdentifier`).

**Response:** `200 OK`  
```json
{ "electronicSignture": "<path-or-url>" }
```

---

#### POST `/api/Employees/{id}/signature`

Upload electronic signature image.

**Auth:** Any authenticated user.  
- **Admin:** may set `id` to any employee.  
- **Employee:** `id` is ignored; upload applies to current user.

**Request:** `multipart/form-data`, field name for file as used by client (e.g. `file`).

**Response:** `200 OK` — success message.  
**Errors:** `400` no file or upload failure.

---

### 3. Attendance

#### POST `/api/Attendance/check-in`

Record check-in for current user.  
**Auth:** **Employee** role.

**Response:** `200 OK`  
```json
{ "message": "Check-in successful" }
```

**Errors:** `400` — e.g. outside 7:30–9:00 window or already checked in today.

---

#### GET `/api/Attendance/history`

Last 7 days of attendance for current user.  
**Auth:** **Employee**.

**Response:** `200 OK` — array of `AttendanceDto`:

```json
[
  {
    "id": 0,
    "employeeId": "string",
    "firstName": "string",
    "lastName": "string",
    "phoneNumber": "string",
    "nationalId": "string",
    "age": 0,
    "electronicSignature": "string | null",
    "checkInTime": "2025-01-31T00:00:00"
  }
]
```

---

#### GET `/api/Attendance/daily`

Daily attendance list for a given date.  
**Auth:** **Admin**.

**Query:** `date` (optional, default: today) — ISO date.

**Response:** `200 OK` — array of `AttendanceDto` (same shape as above).

---

#### GET `/api/Attendance/attendanceperweek/{id}`

Total working hours for the last 7 days for employee `id`.  
**Auth:** **Admin**.

**Response:** `200 OK` — integer (e.g. `40`).  
**Errors:** `404` when no data.

---

#### GET `/api/Attendance/weekly`

Weekly summary.  
**Auth:** Any authenticated user.

**Query:** `weekStart` (required) — start of week (e.g. `2025-01-27`).

- **Employee:** summary for current user.  
- **Admin:** summary for all employees.

**Response:** `200 OK`  

For one user — `WeeklyAttendanceSummaryDto`:

```json
{
  "weekStart": "2025-01-27T00:00:00",
  "weekEnd": "2025-02-03T00:00:00",
  "daysAttended": 5,
  "totalHours": 40.0
}
```

For admin (all employees): array of `WeeklyAttendanceSummaryDto`.

---

## Authentication & Authorization

- **Scheme:** JWT Bearer.
- **Claims:** `NameIdentifier` (user id), `Role` (Admin/Employee).
- **Config:** `appsettings.json` → `Jwt:Key`, `Issuer`, `Audience`, `DurationInMinutes`.
- **Roles:** `Admin` — full employee and attendance management; `Employee` — own attendance and signature.
- **CORS:** Policy `AllowAngular` (e.g. for local frontend); restrict origins in production.

---

## Setup & Run

### Prerequisites

- .NET 10 SDK  
- SQL Server (LocalDB or full instance)

### 1. Clone and open

```bash
git clone <repo-url>
cd Employee-Management-API-master
```

Open `Employee-Management.slnx` or the solution in Visual Studio / Rider.

### 2. Configure appsettings

Edit `Employee-Management/appsettings.json` (and optionally `appsettings.Development.json`):

- **ConnectionStrings:EmployeeManagementDb** — your SQL Server connection string.
- **Jwt:Key** — secure secret (min 32 chars recommended).
- **Jwt:Issuer**, **Jwt:Audience**, **Jwt:DurationInMinutes** — adjust if needed.

Do not commit real credentials; use User Secrets or environment variables in production.

### 3. Database

From repo root:

```bash
cd Employee-Management
dotnet ef database update
```

Or in Package Manager Console (Visual Studio):

```powershell
Update-Database
```

### 4. Run

```bash
cd Employee-Management
dotnet run
```

Or F5 in IDE. Check `Properties/launchSettings.json` for port and HTTPS. OpenAPI (Swagger) is available in Development at `/openapi/v1.json` and typically via Swagger UI if configured.

### 5. First admin user

The app does not seed an admin by default. Options:

- Use a separate one-off script or migration to create the first `Admin` user, or  
- Register via `/api/Auth/register` then update the `Users` table and set `Role = "Admin"` for that user (or add a seed in code).

---

## Validation & Business Rules

### Global validation (DTOs)

- **UserName:** Required, min 4 chars, unique (custom `UniqueUsername` attribute).
- **Password:** Required on register; min 8 chars, at least one upper and one lower (optional on update).
- **FirstName, LastName:** Required; max 50 on entity.
- **NationalId:** Required, exactly 14 digits.
- **Age:** 18–120.
- **PhoneNumber:** Required, valid phone format.
- **ElectronicSignature:** Max 500 chars in DTO (storage may be path/URL).

### Attendance

- **Check-in window:** Only between **7:30 AM** and **9:00 AM** (server local time).
- **One check-in per day** per employee.
- **Weekly hours:** Calculated as `daysAttended * 8` hours.

### Signature upload

- File required; type/size limits should be enforced in code or configuration (document any limits for frontend).

---

## Project Structure

```
Employee-Management-API-master/
├── Employee-Management/
│   ├── Controllers/
│   │   ├── Auth/
│   │   │   └── AuthController.cs
│   │   └── Management/
│   │       ├── AttendanceController.cs
│   │       └── EmployeesController.cs
│   ├── Data/
│   │   └── EmployeeManagementDbContext.cs
│   ├── Entites/
│   │   ├── AppUser.cs
│   │   └── Attendance.cs
│   ├── Extensions/
│   │   └── ServiceCollectionExtensions.cs
│   ├── Migrations/
│   ├── Models/
│   │   ├── Common/
│   │   │   └── AppRoles.cs
│   │   ├── AttendanceDto.cs
│   │   ├── EmployeeDto.cs
│   │   ├── GetEmployeeDto.cs
│   │   ├── LoginDto.cs
│   │   ├── LoginResponseDto.cs
│   │   ├── PaginatedResponse.cs
│   │   ├── RegisterDto.cs
│   │   ├── SignatureUploadDto.cs
│   │   ├── UpdateEmployeeDto.cs
│   │   └── WeeklyAttendanceSummaryDto.cs
│   ├── Repositories/
│   │   ├── AttendanceRepo/
│   │   └── EmployeeRepo/
│   ├── Services/
│   │   ├── AttendanceService/
│   │   ├── Auth/
│   │   └── EmployeeService/
│   ├── Validators/
│   │   └── UniqueUsernameAttribute.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Program.cs
│   └── Employee-Management.csproj
├── Employee-Management.slnx
└── TECH_TASK.md
```

---

## Summary

This document describes the **Employee Management API** as a layered .NET 10 REST API with JWT auth, role-based access (Admin/Employee), employee CRUD, time-windowed attendance check-in, weekly/daily reporting, and electronic signature upload. Use this guide for onboarding, implementation tasks, or as a tech task specification for your job.
