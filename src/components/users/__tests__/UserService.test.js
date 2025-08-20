// src/components/users/__tests__/UserService.test.js
import { userService } from '../../userService';
import { getApiUrl } from '../../../utils/api';

// Mock the fetch API
global.fetch = jest.fn();

// Mock the getApiUrl function
jest.mock('../../../utils/api', () => ({
  getApiUrl: jest.fn((endpoint) => `http://localhost:5000${endpoint}`)
}));

describe('UserService', () => {
  beforeEach(() => {
    fetch.mockClear();
    getApiUrl.mockClear();
  });

  const mockToken = 'test-token';
  const mockUser = {
    id: 1,
    full_name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    role: 'Student',
    enrollment_status: 'Active',
    department_group: 'Computer Science',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z'
  };

  describe('getAll', () => {
    it('should fetch all users successfully', async () => {
      const mockResponse = { users: [mockUser] };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.getAll(mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(userService.getAll(mockToken)).rejects.toThrow('Network error');
    });
  });

  describe('getById', () => {
    it('should fetch a single user by ID successfully', async () => {
      const mockResponse = { user: mockUser };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.getById(1, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        {
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle user not found', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ error: 'User not found' })
      });

      const result = await userService.getById(999, mockToken);
      expect(result).toEqual({ error: 'User not found' });
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const newUserData = {
        full_name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'Instructor',
        department_group: 'Mathematics'
      };

      const mockResponse = { user: { ...newUserData, id: 2 } };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.create(newUserData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify(newUserData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidUserData = { full_name: '' };
      fetch.mockResolvedValueOnce({
        json: async () => ({ error: 'Validation failed' })
      });

      const result = await userService.create(invalidUserData, mockToken);
      expect(result).toEqual({ error: 'Validation failed' });
    });
  });

  describe('update', () => {
    it('should update an existing user successfully', async () => {
      const updateData = {
        full_name: 'John Updated',
        email: 'john.updated@example.com'
      };

      const mockResponse = { user: { ...mockUser, ...updateData } };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.update(1, updateData, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify(updateData)
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ error: 'User not found' })
      });

      const result = await userService.update(999, {}, mockToken);
      expect(result).toEqual({ error: 'User not found' });
    });
  });

  describe('updateStatus', () => {
    it('should suspend a user successfully', async () => {
      const mockResponse = { 
        user: { ...mockUser, enrollment_status: 'Suspended' } 
      };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.updateStatus(1, 'Suspended', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1/suspend',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ enrollment_status: 'Suspended' })
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should reactivate a user successfully', async () => {
      const mockResponse = { 
        user: { ...mockUser, enrollment_status: 'Active' } 
      };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.updateStatus(1, 'Active', mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1/suspend',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${mockToken}`
          },
          body: JSON.stringify({ enrollment_status: 'Active' })
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const mockResponse = { message: 'User deleted successfully' };
      fetch.mockResolvedValueOnce({
        json: async () => mockResponse
      });

      const result = await userService.delete(1, mockToken);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/users/1',
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${mockToken}`
          }
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle delete errors', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ error: 'User not found' })
      });

      const result = await userService.delete(999, mockToken);
      expect(result).toEqual({ error: 'User not found' });
    });
  });
});
