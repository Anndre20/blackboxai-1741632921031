import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Login from '../Login';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API calls
jest.mock('../../services/auth.service', () => ({
  login: jest.fn()
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    renderLogin();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty form submission', async () => {
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(await screen.findByText('Password is required')).toBeInTheDocument();
  });

  it('shows error for invalid email format', async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockLoginResponse = {
      success: true,
      token: 'fake-token',
      user: {
        id: '1',
        email: 'test@example.com'
      }
    };

    const { login } = require('../../services/auth.service');
    login.mockResolvedValueOnce(mockLoginResponse);

    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('handles login failure', async () => {
    const { login } = require('../../services/auth.service');
    login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
    });

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'text');

    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('maintains remember me state', async () => {
    renderLogin();

    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });

    await act(async () => {
      fireEvent.click(rememberMeCheckbox);
    });

    expect(rememberMeCheckbox).toBeChecked();

    await act(async () => {
      fireEvent.click(rememberMeCheckbox);
    });

    expect(rememberMeCheckbox).not.toBeChecked();
  });

  it('has working navigation links', () => {
    renderLogin();

    const registerLink = screen.getByText(/start your free trial/i);
    const forgotPasswordLink = screen.getByText(/forgot your password/i);

    expect(registerLink).toHaveAttribute('href', '/register');
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
  });

  it('handles social login buttons', () => {
    renderLogin();

    const googleButton = screen.getByRole('button', { name: /google/i });
    const microsoftButton = screen.getByRole('button', { name: /microsoft/i });

    expect(googleButton).toBeInTheDocument();
    expect(microsoftButton).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const { login } = require('../../services/auth.service');
    login.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderLogin();

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.click(submitButton);
    });

    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
