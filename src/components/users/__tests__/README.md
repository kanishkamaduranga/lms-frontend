# User Management TDD Tests

This directory contains comprehensive Test-Driven Development (TDD) tests for the user management module.

## Test Structure

### 1. Unit Tests

#### `UserService.test.js`
Tests for the user service layer that handles all API operations.

**Coverage:**
- ✅ **getAll()** - Fetch all users
- ✅ **getById()** - Fetch single user by ID
- ✅ **create()** - Create new user
- ✅ **update()** - Update existing user
- ✅ **updateStatus()** - Suspend/Reactivate user
- ✅ **delete()** - Delete user
- ✅ **Error handling** - Network errors, validation errors
- ✅ **API response handling** - Success and error responses

#### `UserList.test.js`
Tests for the user list component that displays users in a table format.

**Coverage:**
- ✅ **Rendering** - Loading states, empty states, user data display
- ✅ **User Interactions** - Create, edit, view, delete actions
- ✅ **Status Management** - Suspend/reactivate functionality
- ✅ **Error Handling** - API errors, operation failures
- ✅ **Date Formatting** - Proper date display and null handling
- ✅ **Responsive Design** - Table layout and mobile compatibility

#### `UserForm.test.js`
Tests for the user form component used for creating and editing users.

**Coverage:**
- ✅ **Create User Form** - Empty form, validation, submission
- ✅ **Edit User Form** - Pre-filled data, optional password
- ✅ **Form Validation** - Required fields, email format
- ✅ **Role Selection** - All role options, selection handling
- ✅ **Form Actions** - Submit, cancel, loading states
- ✅ **Dialog Behavior** - Open/close, outside clicks

#### `UserView.test.js`
Tests for the user view component that displays detailed user information.

**Coverage:**
- ✅ **Rendering** - User profile display, loading states
- ✅ **User Information Display** - All user properties, formatting
- ✅ **Suspension History** - Conditional display of suspension data
- ✅ **User Actions** - Edit, suspend/reactivate, delete
- ✅ **Navigation** - Back button, route handling
- ✅ **Route Parameters** - URL parameter handling
- ✅ **Error Handling** - API failures, missing data
- ✅ **Profile Picture** - Image display and fallback

### 2. Integration Tests

#### `UserManagement.integration.test.js`
End-to-end tests for the complete user management workflow.

**Coverage:**
- ✅ **Complete User Lifecycle** - Create, view, edit, suspend, reactivate, delete
- ✅ **Tab Navigation** - Switching between different views
- ✅ **Error Handling Integration** - Cross-component error handling
- ✅ **State Management** - State persistence across tab switches
- ✅ **Data Consistency** - Data refresh after operations

## Test Configuration

### Setup File: `setupTests.js`
Configures the testing environment with:
- Jest DOM matchers
- Window object mocks (confirm, alert, matchMedia)
- IntersectionObserver and ResizeObserver mocks
- Console error suppression for React warnings

### Mock Strategy
- **userService**: Mocked to test component behavior without real API calls
- **AuthContext**: Mocked to provide consistent authentication state
- **React Router**: Mocked for navigation testing
- **Material-UI**: Theme provider wrapper for consistent styling

## Running Tests

### Individual Test Files
```bash
# Run specific test file
npm test UserService.test.js
npm test UserList.test.js
npm test UserForm.test.js
npm test UserView.test.js
npm test UserManagement.integration.test.js
```

### All User Management Tests
```bash
# Run all tests in the users directory
npm test -- src/components/users/__tests__/
```

### With Coverage
```bash
# Run tests with coverage report
npm test -- --coverage --watchAll=false src/components/users/__tests__/
```

## Test Data

### Mock User Object
```javascript
const mockUser = {
  id: 1,
  full_name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  role: 'Student',
  enrollment_status: 'Active',
  department_group: 'Computer Science',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  last_login_date: '2025-01-15T10:30:00.000Z',
  suspension_date: null,
  reactivation_date: null,
  profile_picture: null
};
```

### Test Scenarios Covered

#### User Service Tests
1. **Successful API calls** - All CRUD operations
2. **Error handling** - Network failures, validation errors
3. **Response parsing** - Success and error responses
4. **Authentication** - Token handling in requests

#### Component Tests
1. **Rendering states** - Loading, success, error, empty
2. **User interactions** - Clicks, form submissions, navigation
3. **Data validation** - Form validation, required fields
4. **State management** - Component state updates
5. **Error boundaries** - Error display and recovery

#### Integration Tests
1. **Complete workflows** - End-to-end user management
2. **Cross-component communication** - Data flow between components
3. **Navigation flows** - Tab switching, routing
4. **Data consistency** - State synchronization

## Best Practices Implemented

### 1. Test Organization
- **Describe blocks** for logical grouping
- **Clear test names** that describe the scenario
- **Setup and teardown** with beforeEach/afterEach
- **Mock cleanup** to prevent test interference

### 2. Assertions
- **User-centric assertions** - Test what users see and do
- **Accessibility testing** - Screen reader compatibility
- **Error state testing** - Graceful error handling
- **Loading state testing** - User feedback during operations

### 3. Mock Strategy
- **Service layer mocking** - Isolate component logic
- **Context mocking** - Consistent authentication state
- **Router mocking** - Navigation testing
- **Window object mocking** - Browser API compatibility

### 4. Test Data Management
- **Consistent mock data** - Reusable test fixtures
- **Realistic scenarios** - Edge cases and error conditions
- **Data variation** - Different user states and roles

## Coverage Goals

### Unit Test Coverage
- **Lines**: >90%
- **Functions**: >95%
- **Branches**: >85%
- **Statements**: >90%

### Integration Test Coverage
- **User workflows**: 100%
- **Error scenarios**: 100%
- **Navigation flows**: 100%
- **Data consistency**: 100%

## Continuous Integration

### Pre-commit Hooks
```bash
# Run tests before commit
npm run test:user-management
npm run lint:user-management
```

### CI Pipeline
```yaml
# Example GitHub Actions workflow
- name: Run User Management Tests
  run: |
    npm test -- --coverage --watchAll=false src/components/users/__tests__/
    npm run test:user-management:coverage
```

## Debugging Tests

### Common Issues
1. **Async operations** - Use waitFor for async state changes
2. **Mock cleanup** - Clear mocks between tests
3. **Component unmounting** - Clean up event listeners
4. **State persistence** - Reset component state

### Debug Commands
```bash
# Run tests in debug mode
npm test -- --debug UserList.test.js

# Run with verbose output
npm test -- --verbose src/components/users/__tests__/

# Run specific test case
npm test -- -t "should create user successfully"
```

## Future Enhancements

### Planned Test Additions
1. **Performance testing** - Large dataset handling
2. **Accessibility testing** - Screen reader compatibility
3. **Visual regression testing** - UI consistency
4. **E2E testing** - Browser automation
5. **Security testing** - Input validation, XSS prevention

### Test Maintenance
1. **Regular updates** - Keep tests current with code changes
2. **Refactoring** - Improve test structure and readability
3. **Coverage monitoring** - Track test coverage trends
4. **Performance optimization** - Fast test execution
