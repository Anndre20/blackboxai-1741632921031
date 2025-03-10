describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset database and clear local storage before each test
    cy.resetDatabase();
    cy.clearLocalStorage();
  });

  describe('Registration', () => {
    it('should register a new user successfully', () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        companyName: 'Test Company'
      };

      cy.visit('/register');
      
      // Fill in registration form
      cy.get('[data-testid=firstName-input]').type(userData.firstName);
      cy.get('[data-testid=lastName-input]').type(userData.lastName);
      cy.get('[data-testid=email-input]').type(userData.email);
      cy.get('[data-testid=password-input]').type(userData.password);
      cy.get('[data-testid=confirmPassword-input]').type(userData.password);
      cy.get('[data-testid=companyName-input]').type(userData.companyName);
      cy.get('[data-testid=terms-checkbox]').check();

      // Submit form
      cy.get('[data-testid=register-button]').click();

      // Verify successful registration
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid=user-menu]').should('contain', userData.firstName);
    });

    it('should show validation errors for invalid inputs', () => {
      cy.visit('/register');

      // Submit empty form
      cy.get('[data-testid=register-button]').click();

      // Verify validation errors
      cy.get('[data-testid=firstName-error]').should('be.visible');
      cy.get('[data-testid=lastName-error]').should('be.visible');
      cy.get('[data-testid=email-error]').should('be.visible');
      cy.get('[data-testid=password-error]').should('be.visible');
      cy.get('[data-testid=companyName-error]').should('be.visible');
      cy.get('[data-testid=terms-error]').should('be.visible');
    });

    it('should handle existing email registration attempt', () => {
      // Register first user
      cy.registerByApi({
        email: 'existing@example.com',
        password: 'Password123!'
      });

      // Try to register with same email
      cy.visit('/register');
      cy.fillForm({
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        companyName: 'Test Company'
      });
      cy.get('[data-testid=terms-checkbox]').check();
      cy.get('[data-testid=register-button]').click();

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Email already registered');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      // Create test user before each test
      cy.registerByApi({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should login successfully with valid credentials', () => {
      cy.visit('/login');
      
      // Fill in login form
      cy.get('[data-testid=email-input]').type('test@example.com');
      cy.get('[data-testid=password-input]').type('Password123!');

      // Submit form
      cy.get('[data-testid=login-button]').click();

      // Verify successful login
      cy.url().should('include', '/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      
      // Fill in login form with wrong password
      cy.get('[data-testid=email-input]').type('test@example.com');
      cy.get('[data-testid=password-input]').type('WrongPassword123!');

      // Submit form
      cy.get('[data-testid=login-button]').click();

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Invalid email or password');
    });

    it('should maintain user session after page reload', () => {
      // Login via API
      cy.loginByApi('test@example.com', 'Password123!');
      
      // Visit dashboard
      cy.visit('/dashboard');
      
      // Reload page
      cy.reload();

      // Verify still logged in
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Password Reset', () => {
    beforeEach(() => {
      cy.registerByApi({
        email: 'test@example.com',
        password: 'Password123!'
      });
    });

    it('should send password reset email', () => {
      cy.visit('/forgot-password');
      
      // Fill in email
      cy.get('[data-testid=email-input]').type('test@example.com');

      // Submit form
      cy.get('[data-testid=reset-button]').click();

      // Verify success message
      cy.get('[data-testid=success-message]')
        .should('be.visible')
        .and('contain', 'Reset password email sent');
    });

    it('should handle non-existent email for password reset', () => {
      cy.visit('/forgot-password');
      
      // Fill in non-existent email
      cy.get('[data-testid=email-input]').type('nonexistent@example.com');

      // Submit form
      cy.get('[data-testid=reset-button]').click();

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'No account found with this email');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.loginByApi('test@example.com', 'Password123!');
      cy.visit('/dashboard');
    });

    it('should logout successfully', () => {
      // Click user menu
      cy.get('[data-testid=user-menu]').click();
      
      // Click logout button
      cy.get('[data-testid=logout-button]').click();

      // Verify redirect to login page
      cy.url().should('include', '/login');

      // Verify local storage cleared
      cy.window().its('localStorage').should('be.empty');
    });

    it('should redirect to login page after token expiration', () => {
      // Simulate token expiration
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'expired-token');
      });

      // Reload page
      cy.reload();

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      // Try to access protected route
      cy.visit('/dashboard');

      // Verify redirect to login page
      cy.url().should('include', '/login');
    });

    it('should allow authenticated users to access protected routes', () => {
      // Login via API
      cy.loginByApi('test@example.com', 'Password123!');

      // Visit protected route
      cy.visit('/dashboard');

      // Verify access granted
      cy.url().should('include', '/dashboard');
    });
  });
});
