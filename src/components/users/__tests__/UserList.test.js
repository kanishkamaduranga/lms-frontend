// src/components/users/__tests__/UserList.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import UserList from '../UserList';
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
      {component}
    </ThemeProvider>
  );
};

describe('UserList', () => {
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

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      userService.getAll.mockResolvedValue({ users: [] });
      
      renderWithTheme(<UserList />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render user list when data is loaded', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });

    it('should render empty state when no users', async () => {
      userService.getAll.mockResolvedValue({ users: [] });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });

    it('should display user status chips correctly', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Suspended')).toBeInTheDocument();
      });
    });

    it('should display role chips correctly', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Instructor')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    beforeEach(async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      renderWithTheme(<UserList />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should open create user form when Add User button is clicked', async () => {
      const addButton = screen.getByText('Add User');
      fireEvent.click(addButton);
      
      await waitFor(() => {
        expect(screen.getByText('Add New User')).toBeInTheDocument();
      });
    });

    it('should open edit form when edit button is clicked', async () => {
      const editButtons = screen.getAllByTitle('Edit User');
      fireEvent.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
    });

    it('should call onUserView when view button is clicked', async () => {
      const mockOnUserView = jest.fn();
      renderWithTheme(<UserList onUserView={mockOnUserView} />);
      
      await waitFor(() => {
        const viewButtons = screen.getAllByTitle('View User');
        fireEvent.click(viewButtons[0]);
        expect(mockOnUserView).toHaveBeenCalledWith(1);
      });
    });

    it('should call onUserSelect when user name is clicked', async () => {
      const mockOnUserSelect = jest.fn();
      renderWithTheme(<UserList onUserSelect={mockOnUserSelect} />);
      
      await waitFor(() => {
        const userName = screen.getByText('John Doe');
        fireEvent.click(userName);
        expect(mockOnUserSelect).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Status Management', () => {
    beforeEach(async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      renderWithTheme(<UserList />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should suspend user when suspend button is clicked', async () => {
      userService.updateStatus.mockResolvedValue({ success: true });
      userService.getAll.mockResolvedValue({ 
        users: [{ ...mockUsers[0], enrollment_status: 'Suspended' }] 
      });

      const suspendButtons = screen.getAllByTitle('Suspend User');
      fireEvent.click(suspendButtons[0]);

      await waitFor(() => {
        expect(userService.updateStatus).toHaveBeenCalledWith(1, 'Suspended', 'test-token');
      });
    });

    it('should reactivate user when reactivate button is clicked', async () => {
      userService.updateStatus.mockResolvedValue({ success: true });
      userService.getAll.mockResolvedValue({ 
        users: [{ ...mockUsers[1], enrollment_status: 'Active' }] 
      });

      const reactivateButtons = screen.getAllByTitle('Reactivate User');
      fireEvent.click(reactivateButtons[0]);

      await waitFor(() => {
        expect(userService.updateStatus).toHaveBeenCalledWith(2, 'Active', 'test-token');
      });
    });
  });

  describe('Delete User', () => {
    beforeEach(async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      renderWithTheme(<UserList />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should delete user when delete button is clicked and confirmed', async () => {
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      userService.delete.mockResolvedValue({ success: true });

      const deleteButtons = screen.getAllByTitle('Delete User');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(userService.delete).toHaveBeenCalledWith(1, 'test-token');
      });
    });

    it('should not delete user when delete is cancelled', async () => {
      // Mock window.confirm to return false
      window.confirm = jest.fn(() => false);

      const deleteButtons = screen.getAllByTitle('Delete User');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(userService.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      userService.getAll.mockRejectedValue(new Error('Failed to load users'));
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load users')).toBeInTheDocument();
      });
    });

    it('should display error message when delete fails', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      window.confirm = jest.fn(() => true);
      userService.delete.mockRejectedValue(new Error('Failed to delete user'));
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete User');
        fireEvent.click(deleteButtons[0]);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
      });
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        // Check that dates are formatted (not showing as raw ISO strings)
        expect(screen.getByText(/1\/1\/2025/)).toBeInTheDocument();
        expect(screen.getByText(/1\/2\/2025/)).toBeInTheDocument();
      });
    });

    it('should show "Never" for null last login date', async () => {
      userService.getAll.mockResolvedValue({ users: mockUsers });
      
      renderWithTheme(<UserList />);
      
      await waitFor(() => {
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });
});
