// src/components/users/__tests__/UserView.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import UserView from '../UserView';
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

describe('UserView', () => {
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

  const mockOnBack = jest.fn();
  const mockOnUserUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading state initially', () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      
      renderWithTheme(<UserView userId={1} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render user profile when data is loaded', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('User Profile')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Student')).toBeInTheDocument();
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });

    it('should display error when no user ID is provided', () => {
      renderWithTheme(<UserView />);
      
      expect(screen.getByText('No user ID provided')).toBeInTheDocument();
    });

    it('should display error when user not found', async () => {
      userService.getById.mockResolvedValue({ error: 'User not found' });
      
      renderWithTheme(<UserView userId={999} />);
      
      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('should display error when API call fails', async () => {
      userService.getById.mockRejectedValue(new Error('Network error'));
      
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load user details: Network error')).toBeInTheDocument();
      });
    });
  });

  describe('User Information Display', () => {
    beforeEach(async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      renderWithTheme(<UserView userId={1} />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should display user avatar', () => {
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
    });

    it('should display user role chip', () => {
      expect(screen.getByText('Student')).toBeInTheDocument();
    });

    it('should display user status chip', () => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should display account information', () => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Last Login')).toBeInTheDocument();
    });

    it('should display account timeline', () => {
      expect(screen.getByText('Account Timeline')).toBeInTheDocument();
      expect(screen.getByText('Created Date')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      // Check that dates are formatted (not showing as raw ISO strings)
      expect(screen.getByText(/1\/1\/2025/)).toBeInTheDocument();
    });

    it('should show "Not available" for null dates', async () => {
      const userWithNullDates = {
        ...mockUser,
        last_login_date: null,
        created_at: null,
        updated_at: null
      };
      
      userService.getById.mockResolvedValue({ user: userWithNullDates });
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getAllByText('Not available')).toHaveLength(3);
      });
    });
  });

  describe('Suspension History', () => {
    it('should display suspension history when available', async () => {
      const suspendedUser = {
        ...mockUser,
        enrollment_status: 'Suspended',
        suspension_date: '2025-01-10T00:00:00.000Z',
        reactivation_date: '2025-01-20T00:00:00.000Z'
      };
      
      userService.getById.mockResolvedValue({ user: suspendedUser });
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Suspension History')).toBeInTheDocument();
        expect(screen.getByText('Suspended Date')).toBeInTheDocument();
        expect(screen.getByText('Reactivated Date')).toBeInTheDocument();
      });
    });

    it('should not display suspension history when not available', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Suspension History')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Actions', () => {
    beforeEach(async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      renderWithTheme(<UserView userId={1} onBack={mockOnBack} onUserUpdate={mockOnUserUpdate} />);
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should open edit form when edit button is clicked', async () => {
      fireEvent.click(screen.getByText('Edit User'));
      
      await waitFor(() => {
        expect(screen.getByText('Edit User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      });
    });

    it('should suspend user when suspend button is clicked', async () => {
      userService.updateStatus.mockResolvedValue({ success: true });
      userService.getById.mockResolvedValue({ 
        user: { ...mockUser, enrollment_status: 'Suspended' } 
      });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(screen.getByText('Suspend'));
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(userService.updateStatus).toHaveBeenCalledWith(1, 'Suspended', 'test-token');
      });
    });

    it('should reactivate user when reactivate button is clicked', async () => {
      const suspendedUser = { ...mockUser, enrollment_status: 'Suspended' };
      userService.getById.mockResolvedValue({ user: suspendedUser });
      userService.updateStatus.mockResolvedValue({ success: true });
      
      renderWithTheme(<UserView userId={1} onBack={mockOnBack} onUserUpdate={mockOnUserUpdate} />);
      
      await waitFor(() => {
        expect(screen.getByText('Reactivate')).toBeInTheDocument();
      });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(screen.getByText('Reactivate'));
      
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(userService.updateStatus).toHaveBeenCalledWith(1, 'Active', 'test-token');
      });
    });

    it('should delete user when delete button is clicked', async () => {
      userService.delete.mockResolvedValue({ success: true });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(screen.getByText('Delete User')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete user "John Doe"/)).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(userService.delete).toHaveBeenCalledWith(1, 'test-token');
        expect(mockOnBack).toHaveBeenCalled();
        expect(mockOnUserUpdate).toHaveBeenCalled();
      });
    });

    it('should not delete user when delete is cancelled', async () => {
      // Mock window.confirm to return false
      window.confirm = jest.fn(() => false);
      
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(screen.getByText('Delete User')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Cancel'));
      
      expect(userService.delete).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      renderWithTheme(<UserView userId={1} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByLabelText('back'));
      
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should navigate to users list when no onBack provided', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      const mockNavigate = jest.fn();
      
      // Mock useNavigate
      jest.doMock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate
      }));
      
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByLabelText('back'));
      
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });

  describe('Route Parameters', () => {
    it('should use route parameter when available', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      
      renderWithTheme(
        <MemoryRouter initialEntries={['/admin/users/123']}>
          <UserView />
        </MemoryRouter>
      );
      
      await waitFor(() => {
        expect(userService.getById).toHaveBeenCalledWith('123', 'test-token');
      });
    });

    it('should use prop userId when route parameter not available', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      
      renderWithTheme(<UserView userId={456} />);
      
      await waitFor(() => {
        expect(userService.getById).toHaveBeenCalledWith(456, 'test-token');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when status update fails', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      userService.updateStatus.mockRejectedValue(new Error('Update failed'));
      
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(screen.getByText('Suspend'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to suspend user')).toBeInTheDocument();
      });
    });

    it('should display error message when delete fails', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      userService.delete.mockRejectedValue(new Error('Delete failed'));
      
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);
      
      fireEvent.click(screen.getByText('Delete'));
      fireEvent.click(screen.getByText('Delete'));
      
      await waitFor(() => {
        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
      });
    });
  });

  describe('Profile Picture', () => {
    it('should display profile picture when available', async () => {
      const userWithPicture = {
        ...mockUser,
        profile_picture: 'https://example.com/avatar.jpg'
      };
      
      userService.getById.mockResolvedValue({ user: userWithPicture });
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        const avatar = screen.getByRole('img', { hidden: true });
        expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      });
    });

    it('should display default person icon when no profile picture', async () => {
      userService.getById.mockResolvedValue({ user: mockUser });
      renderWithTheme(<UserView userId={1} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
      });
    });
  });
});
