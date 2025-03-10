import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Register from '../Register';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API calls
jest.mock('../../services/auth.service', () => ({
  register: jest.fn()
}));

const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders registration form with all fields', () => {
      renderRegister();

      expect(screen.getByText('Start Your Free Trial')).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /terms/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start free trial/i })).toBeInTheDocument();
    });

    it('renders social login options', () => {
      renderRegister();

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /microsoft/i })).toBeInTheDocument();
    });

    it('displays login link for existing users', () => {
      renderRegister();

      const loginLink = screen.getByText(/already have an account/i);
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for empty form submission', async () => {
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /start free trial/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText('First name is required')).toBeInTheDocument();
      expect(await screen.findByText('Last name is required')).toBeInTheDocument();
      expect(await screen.findByText('Email is required')).toBeInTheDocument();
      expect(await screen.findByText('Password is required')).toBeInTheDocument();
      expect(await screen.findByText('Company name is required')).toBeInTheDocument();
    });

    it('validates email format', async () => {
      renderRegister();

      const emailInput = screen.getByLabelText(/email address/i);

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });

      expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.blur(passwordInput);
      });

      expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('validates password confirmation match', async () => {
      renderRegister();

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
        fireEvent.blur(confirmPasswordInput);
      });

      expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
    });

    it('requires terms acceptance', async () => {
      renderRegister();

      const submitButton = screen.getByRole('button', { name: /start free trial/i });

      await act(async () => {
        fireEvent.click(submitButton);
      });

      expect(await screen.findByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'StrongPass123!',
      confirmPassword: 'StrongPass123!',
      companyName: 'Test Company',
      agreeToTerms: true
    };

    it('handles successful registration', async () => {
      const { register } = require('../../services/auth.service');
      register.mockResolvedValueOnce({ success: true });

      renderRegister();

      // Fill in form
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: validFormData.firstName } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: validFormData.lastName } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: validFormData.email } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: validFormData.password } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: validFormData.confirmPassword } });
        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: validFormData.companyName } });
        fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
      });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start free trial/i }));
      });

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith(validFormData);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('handles registration failure', async () => {
      const { register } = require('../../services/auth.service');
      register.mockRejectedValueOnce(new Error('Registration failed'));

      renderRegister();

      // Fill in form
      await act(async () => {
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: validFormData.firstName } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: validFormData.lastName } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: validFormData.email } });
        fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: validFormData.password } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: validFormData.confirmPassword } });
        fireEvent.change(screen.getByLabelText(/company name/i), { target: { value: validFormData.companyName } });
        fireEvent.click(screen.getByRole('checkbox', { name: /terms/i }));
      });

      // Submit form
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /start free trial/i }));
      });

      expect(await screen.findByText('Registration failed. Please try again.')).toBeInTheDocument();
    });
  });

  describe('Social Login', () => {
    it('handles Google sign-up click', () => {
      renderRegister();

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      // Add expectations based on your implementation
    });

    it('handles Microsoft sign-up click', () => {
      renderRegister();

      const microsoftButton = screen.getByRole('button', { name: /microsoft/i });
      fireEvent.click(microsoftButton);

      // Add expectations based on your implementation
    });
  });

  describe('Accessibility', () => {
    it('has proper form labeling', () => {
      renderRegister();

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAttribute('aria-label');
      });
    });

    it('maintains proper focus order', () => {
      renderRegister();

      const focusableElements = screen.getAllByRole('textbox');
      focusableElements.forEach((element, index) => {
        if (index > 0) {
          expect(element.tabIndex).toBe(0);
        }
      });
    });
  });
});
