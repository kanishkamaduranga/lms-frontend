// src/components/users/__tests__/UserManagement.integration.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import UserManagement from '../UserManagement';
import { userService } from '../../userService';

// Mock the userService
jest.mock('../../userService');

// Mock the AuthContext
const mockUseAuth = {
  token: 'test-token'
};

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth
}));

// Create a theme for Material-UI components
const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </ThemeProvider>
  );
};

describe('UserManagement Integration', () => {
  const mockUsers = [
    {
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
      profile_picture: null
    },
    {
      id: 2,
      full_name: 'Jane Smith',
      username: 'janesmith',
      email: 'jane@example.com',
      role: 'Instructor',
      enrollment_status: 'Suspended',
      department_group: 'Mathematics',
      created_at: '2025-01-02T00:00:00.000Z',
      updated_at: '2025-01-02T00:00:00.000Z',
      last_login_date: null,
      profile_picture: null
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete User Management Workflow', () => {
    it('should handle complete user lifecycle: create, view, edit, suspend, reactivate, delete', async () => {
      // Initial load
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserManagement />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });

      // Test creating a new user
      fireEvent.click(screen.getByText('Add User'));
      
      await waitFor(() => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'New User' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'newuser' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'newuser@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Mock successful creation
      userService.create.mockResolvedValue({ 
        user: { ...mockUsers[0], id: 3, full_name: 'New User' } 
      });
      userService.getAll.mockResolvedValue({ 
        users: [...mockUsers, { ...mockUsers[0], id: 3, full_name: 'New User' }] 
      });

      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(userService.create).toHaveBeenCalled();
        expect(screen.getByText('New User')).toBeInTheDocument();
      });

      // Test viewing user details
      const viewButtons = screen.getAllByTitle('View User');
      fireEvent.click(viewButtons[0]); // View first user

      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });

      // Test editing user
      fireEvent.click(screen.getByText('Edit User'));
      
      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });

      // Update user information
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Updated' }
      });

      userService.update.mockResolvedValue({ 
        user: { ...mockUsers[0], full_name: 'John Updated' } 
      });

      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(userService.update).toHaveBeenCalled();
      });

      // Test suspending user
      userService.updateStatus.mockResolvedValue({ success: true });
      userService.getAll.mockResolvedValue({ 
        users: [{ ...mockUsers[0], enrollment_status: 'Suspended' }, mockUsers[1]] 
      });

      window.confirm = jest.fn(() => true);
      fireEvent.click(screen.getByText('Suspend'));

      await waitFor(() => {
        expect(userService.updateStatus).toHaveBeenCalledWith(1, 'Suspended', 'test-token');
      });

      // Test reactivating user
      userService.getAll.mockResolvedValue({ 
        users: [{ ...mockUsers[0], enrollment_status: 'Active' }, mockUsers[1]] 
      });

      fireEvent.click(screen.getByText('Reactivate'));

      await waitFor(() => {
        expect(userService.updateStatus).toHaveBeenCalledWith(1, 'Active', 'test-token');
      });

      // Test deleting user
      userService.delete.mockResolvedValue({ success: true });
      userService.getAll.mockResolvedValue({ users: [mockUsers[1]] });

      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByText('Delete')); // Confirm deletion

      await waitFor(() => {
        expect(userService.delete).toHaveBeenCalledWith(1, 'test-token');
      });
    });
  });

  describe('Tab Navigation', () => {
    beforeEach(async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      renderWithTheme(<UserManagement />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should switch between tabs correctly', async () => {
      // Initially on User List tab
      expect(screen.getByText('User Management')).toBeInTheDocument();

      // Switch to User Details tab
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]); // User Details tab

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument();
      });

      // Switch to User View tab
      fireEvent.click(tabs[2]); // User View tab

      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });

      // Switch back to User List tab
      fireEvent.click(tabs[0]); // User List tab

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('should disable tabs when no user is selected', () => {
      const tabs = screen.getAllByRole('tab');
      
      // User Details and User View tabs should be disabled initially
      expect(tabs[1]).toHaveAttribute('aria-disabled', 'true');
      expect(tabs[2]).toHaveAttribute('aria-disabled', 'true');
    });

    it('should enable tabs when user is selected', async () => {
      // Select a user by clicking on it
      fireEvent.click(screen.getByText('John Doe'));

      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs[1]).not.toHaveAttribute('aria-disabled', 'true');
        expect(tabs[2]).not.toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle API errors gracefully across all operations', async () => {
      // Initial load with error
      userService.getAll.mockRejectedValue(new Error('Failed to load users'));
      
      renderWithTheme(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument();
      });

      // Retry with success
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      // Trigger a reload (this would typically be done by user action)
      // For this test, we'll simulate by re-rendering
      renderWithTheme(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Test error in user creation
      fireEvent.click(screen.getByText('Add User'));
      
      await waitFor(() => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });

      // Fill form and submit with error
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'testuser' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      userService.create.mockRejectedValue(new Error('User already exists'));
      
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    it('should maintain state correctly when switching between tabs', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select a user
      fireEvent.click(screen.getByText('John Doe'));

      // Switch to User View tab
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[2]);

      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Switch back to User List
      fireEvent.click(tabs[0]);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Switch to User Details
      fireEvent.click(tabs[1]);

      await waitFor(() => {
        expect(screen.getByText('User Details')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should clear selected user when going back to list', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Select a user and go to User View
      fireEvent.click(screen.getByText('John Doe'));
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[2]);

      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
      });

      // Go back to list
      fireEvent.click(screen.getByLabelText('back'));

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        // Tabs should be disabled again
        const updatedTabs = screen.getAllByRole('tab');
        expect(updatedTabs[1]).toHaveAttribute('aria-disabled', 'true');
        expect(updatedTabs[2]).toHaveAttribute('aria-disabled', 'true');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should refresh data after successful operations', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserManagement />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Perform an operation that should refresh the list
      const editButtons = screen.getAllByTitle('Edit User');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
      });

      // Update user
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Updated' }
      });

      userService.update.mockResolvedValue({ 
        user: { ...mockUsers[0], full_name: 'John Updated' } 
      });
      userService.getAll.mockResolvedValue({ 
        users: [{ ...mockUsers[0], full_name: 'John Updated' }, mockUsers[1]] 
      });

      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(userService.getAll).toHaveBeenCalled(); // Should refresh the list
      });
    });
  });
});
