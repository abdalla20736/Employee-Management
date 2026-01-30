# Quick Setup Guide

## Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Base URL** (if needed)
   - Edit `src/app/core/constants/api.constants.ts`
   - Update `API_BASE_URL` if your API is hosted elsewhere
   - Default: `http://157.90.107.101:5065`

3. **Run Development Server**
   ```bash
   npm start
   ```
   - Application will be available at `http://localhost:4200`

## Project Structure Overview

- **Core**: Services, guards, interceptors, models, constants
- **Features**: Admin and Employee feature modules
- **Shared**: Reusable components (navbar, toast, signature)

## Key Features Implemented

✅ JWT Authentication with interceptors  
✅ Role-based route guards (Admin/Employee)  
✅ Employee CRUD operations  
✅ Paginated, sortable, filterable employee list  
✅ Daily attendance tracking  
✅ Check-in with time window validation (7:30 AM - 9:00 AM)  
✅ Signature upload/draw component  
✅ Responsive Bootstrap UI  
✅ Form validation  
✅ Toast notifications  

## Testing the Application

1. **Login**: Use admin or employee credentials from your API
2. **Admin Flow**: 
   - View dashboard → Manage employees → View attendance
3. **Employee Flow**:
   - View dashboard → Check in → View history → Manage profile

## Notes

- Ensure your backend API is running and accessible
- CORS must be enabled on the backend for `http://localhost:4200`
- JWT tokens are stored in localStorage
- Check-in validation enforces time window and one-per-day limit
