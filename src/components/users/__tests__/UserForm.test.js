// src/components/users/__tests__/UserForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import UserForm from '../UserForm';
import { userService } from '../../userService';

// Mock the userService
jest.mock('../../userService');

// Create a theme for Material-UI components
const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('UserForm', () => {
  const mockToken = 'test-token';
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    token: mockToken,
    user: null
  };

  const mockUser = {
    id: 1,
    full_name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    role: 'Student',
    department_group: 'Computer Science'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User Form', () => {
    it('should render create user form with empty fields', () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      expect(screen.getByText('Add New User')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toHaveValue('');
      expect(screen.getByLabelText('Username')).toHaveValue('');
      expect(screen.getByLabelText('Email')).toHaveValue('');
      expect(screen.getByLabelText('Password')).toHaveValue('');
      expect(screen.getByDisplayValue('Student')).toBeInTheDocument();
      expect(screen.getByLabelText('Department Group')).toHaveValue('');
    });

    it('should have password as required field for new users', () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      const passwordField = screen.getByLabelText('Password');
      expect(passwordField).toBeRequired();
    });

    it('should create user successfully when form is submitted', async () => {
      userService.create.mockResolvedValue({ user: { ...mockUser, id: 2 } });

      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in the form
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Jane Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'janedoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'jane@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByDisplayValue('Student'), {
        target: { value: 'Instructor' }
      });
      fireEvent.change(screen.getByLabelText('Department Group'), {
        target: { value: 'Mathematics' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(userService.create).toHaveBeenCalledWith({
          full_name: 'Jane Doe',
          username: 'janedoe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'Instructor',
          department_group: 'Mathematics'
        }, mockToken);
        expect(mockOnSave).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should display error message when creation fails', async () => {
      userService.create.mockRejectedValue(new Error('User already exists'));

      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'Jane Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'janedoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'jane@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      // Try to submit without filling required fields
      fireEvent.click(screen.getByText('Create'));

      // Form should not submit and should show validation errors
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('Edit User Form', () => {
    const editProps = {
      ...defaultProps,
      user: mockUser
    };

    it('should render edit user form with pre-filled data', () => {
      renderWithTheme(<UserForm {...editProps} />);

      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toHaveValue('John Doe');
      expect(screen.getByLabelText('Username')).toHaveValue('johndoe');
      expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
      expect(screen.getByDisplayValue('Student')).toBeInTheDocument();
      expect(screen.getByLabelText('Department Group')).toHaveValue('Computer Science');
    });

    it('should have password as optional field for existing users', () => {
      renderWithTheme(<UserForm {...editProps} />);

      const passwordField = screen.getByLabelText('Password');
      expect(passwordField).not.toBeRequired();
      expect(screen.getByText('Leave blank to keep current password')).toBeInTheDocument();
    });

    it('should update user successfully when form is submitted', async () => {
      userService.update.mockResolvedValue({ user: { ...mockUser, full_name: 'John Updated' } });

      renderWithTheme(<UserForm {...editProps} />);

      // Update the form
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Updated' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john.updated@example.com' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(userService.update).toHaveBeenCalledWith(1, {
          full_name: 'John Updated',
          username: 'johndoe',
          email: 'john.updated@example.com',
          password: '',
          role: 'Student',
          department_group: 'Computer Science'
        }, mockToken);
        expect(mockOnSave).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should include password in update if provided', async () => {
      userService.update.mockResolvedValue({ user: mockUser });

      renderWithTheme(<UserForm {...editProps} />);

      // Fill in password
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'newpassword123' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(userService.update).toHaveBeenCalledWith(1, expect.objectContaining({
          password: 'newpassword123'
        }), mockToken);
      });
    });

    it('should display error message when update fails', async () => {
      userService.update.mockRejectedValue(new Error('Update failed'));

      renderWithTheme(<UserForm {...editProps} />);

      // Submit the form
      fireEvent.click(screen.getByText('Update'));

      await waitFor(() => {
        expect(screen.getByText('Update failed')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in form with invalid email
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'johndoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'invalid-email' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      // Form should not submit due to invalid email
      expect(userService.create).not.toHaveBeenCalled();
    });

    it('should validate required fields are not empty', async () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      // Try to submit with empty required fields
      fireEvent.click(screen.getByText('Create'));

      // Form should not submit
      expect(userService.create).not.toHaveBeenCalled();
    });
  });

  describe('Role Selection', () => {
    it('should display all role options', () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      const roleSelect = screen.getByDisplayValue('Student');
      fireEvent.mouseDown(roleSelect);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Instructor')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('should allow role selection', async () => {
      userService.create.mockResolvedValue({ user: mockUser });

      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'johndoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Change role
      fireEvent.change(screen.getByDisplayValue('Student'), {
        target: { value: 'Admin' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      await waitFor(() => {
        expect(userService.create).toHaveBeenCalledWith(expect.objectContaining({
          role: 'Admin'
        }), mockToken);
      });
    });
  });

  describe('Form Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      userService.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'johndoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
    });

    it('should disable form during submission', async () => {
      userService.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithTheme(<UserForm {...defaultProps} />);

      // Fill in required fields
      fireEvent.change(screen.getByLabelText('Full Name'), {
        target: { value: 'John Doe' }
      });
      fireEvent.change(screen.getByLabelText('Username'), {
        target: { value: 'johndoe' }
      });
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'john@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });

      // Submit the form
      fireEvent.click(screen.getByText('Create'));

      // Form should be disabled during submission
      expect(screen.getByText('Cancel')).toBeDisabled();
    });
  });

  describe('Dialog Behavior', () => {
    it('should not render when open is false', () => {
      renderWithTheme(<UserForm {...defaultProps} open={false} />);

      expect(screen.queryByText('Add New User')).not.toBeInTheDocument();
    });

    it('should close dialog when clicking outside', () => {
      renderWithTheme(<UserForm {...defaultProps} />);

      // Simulate clicking outside the dialog
      fireEvent.click(document.body);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
