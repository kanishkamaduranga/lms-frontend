# User Management Module

This module provides comprehensive user management functionality for the LMS system.

## Features

### User List (`UserList.js`)
- Display all users in a table format
- Shows user avatar, name, username, email, role, status, department, and timestamps
- Actions: Edit, Suspend/Reactivate, Delete
- Click on user name/avatar to view detailed information
- Add new users via modal form

### User Form (`UserForm.js`)
- Create new users
- Edit existing user information
- Form validation for required fields
- Role selection (Admin, Instructor, Student, Guest)
- Password field (optional for updates)

### User Details (`UserDetails.js`)
- Comprehensive user profile view
- Personal information display
- Account status and role information
- Account timeline (created, updated, last login)
- Suspension history (if applicable)
- Profile picture display

### User View (`UserView.js`)
- Dedicated user profile page with full-screen layout
- Action buttons for edit, suspend/reactivate, and delete
- Organized information in cards with clear sections
- Back navigation support
- Can be accessed via direct URL or from user list
- Integrated edit form and delete confirmation dialogs

### User Service (`userService.js`)
- API integration for all user operations
- CRUD operations (Create, Read, Update, Delete)
- User status management (suspend/reactivate)
- Error handling and response parsing

## API Endpoints Used

Based on the Postman collection, this module integrates with:

- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `PATCH /api/users/{id}/suspend` - Suspend/Reactivate user
- `DELETE /api/users/{id}` - Delete user

## User Properties

The module handles the following user properties:
- `id` - Unique identifier
- `full_name` - User's full name
- `username` - Unique username
- `email` - Email address
- `password` - Password (not displayed in lists)
- `role` - User role (Admin, Instructor, Student, Guest)
- `enrollment_status` - Account status ('Active' or 'Suspended')
- `department_group` - Department assignment
- `profile_picture` - Profile image URL
- `created_at` - Account creation date
- `updated_at` - Last update date
- `last_login_date` - Last login timestamp
- `suspension_date` - Suspension date (if applicable)
- `reactivation_date` - Reactivation date (if applicable)

## Usage

### Basic Usage
```jsx
import { UsersPage } from './components/users';

// In your route
<Route path="/admin/users" element={<UsersPage />} />
```

### Advanced Usage
```jsx
import { UserList, UserForm, UserDetails, UserView } from './components/users';

// Custom implementation
<UserList onUserSelect={(userId) => setSelectedUser(userId)} onUserView={(userId) => navigate(`/admin/users/${userId}`)} />
<UserForm open={open} onClose={handleClose} onSave={handleSave} />
<UserDetails userId={selectedUser} onClose={handleClose} />
<UserView userId={selectedUser} onBack={() => navigate('/admin/users')} />
```

## Styling

The module uses Material-UI components and follows the existing design patterns:
- Consistent color scheme for roles and status
- Responsive design for mobile and desktop
- Loading states and error handling
- Tooltips for better UX
- Confirmation dialogs for destructive actions

## Security

- All API calls require authentication token
- Password fields are properly handled
- Confirmation dialogs for sensitive operations
- Role-based access control (should be implemented on backend)

## Dependencies

- React
- Material-UI
- React Router (for navigation)
- Custom API utilities
- Authentication context
