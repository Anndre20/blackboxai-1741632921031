// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Preserve cookies between tests
Cypress.Cookies.defaults({
  preserve: ['token', 'session_id', 'remember_token']
});

// Ignore uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Log all console messages
Cypress.on('window:before:load', (win) => {
  cy.spy(win.console, 'log').as('consoleLog');
  cy.spy(win.console, 'error').as('consoleError');
  cy.spy(win.console, 'warn').as('consoleWarn');
});

// Custom error handling
Cypress.on('fail', (error, runnable) => {
  // we can't override test timeout error message
  if (error.message.includes('timed out after')) {
    throw error;
  }
  
  // we can override other error messages
  error.message = `${error.message}\n\nTest: ${runnable.title}`;
  throw error;
});

// Configure global behavior
beforeEach(() => {
  // Reset viewport size
  cy.viewport(1280, 720);

  // Clear local storage
  cy.clearLocalStorage();

  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });

  // Preserve cookies
  Cypress.Cookies.preserveOnce('token', 'session_id', 'remember_token');
});

// Custom commands
Cypress.Commands.add('login', (email = 'test@example.com', password = 'Password123!') => {
  cy.visit('/login');
  cy.get('[data-testid=email-input]').type(email);
  cy.get('[data-testid=password-input]').type(password);
  cy.get('[data-testid=login-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('register', (userData = {}) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Password123!',
    companyName: 'Test Company'
  };

  const data = { ...defaultData, ...userData };

  cy.visit('/register');
  cy.get('[data-testid=firstName-input]').type(data.firstName);
  cy.get('[data-testid=lastName-input]').type(data.lastName);
  cy.get('[data-testid=email-input]').type(data.email);
  cy.get('[data-testid=password-input]').type(data.password);
  cy.get('[data-testid=companyName-input]').type(data.companyName);
  cy.get('[data-testid=terms-checkbox]').check();
  cy.get('[data-testid=register-button]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid=user-menu]').click();
  cy.get('[data-testid=logout-button]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('uploadFile', (fileName, fileType = 'application/pdf') => {
  cy.get('[data-testid=file-input]').attachFile({
    filePath: fileName,
    mimeType: fileType
  });
});

Cypress.Commands.add('mockApi', (route, response) => {
  cy.intercept(route, response).as('apiCall');
});

Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', 200);
});

// Custom assertions
Cypress.Commands.add('shouldBeVisible', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.visible');
});

Cypress.Commands.add('shouldNotBeVisible', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('not.be.visible');
});

Cypress.Commands.add('shouldBeEnabled', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.enabled');
});

Cypress.Commands.add('shouldBeDisabled', { prevSubject: true }, (subject) => {
  cy.wrap(subject).should('be.disabled');
});

// Error handling
Cypress.on('fail', (error, runnable) => {
  // Add additional context to error messages
  const context = {
    url: Cypress.config('baseUrl'),
    browser: Cypress.browser,
    viewport: Cypress.config('viewport'),
    test: runnable.title
  };

  error.message = `${error.message}\n\nContext: ${JSON.stringify(context, null, 2)}`;
  throw error;
});

// Configure retry-ability
Cypress.config('retries', {
  runMode: 2,
  openMode: 0
});

// Configure timeouts
Cypress.config({
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  pageLoadTimeout: 30000
});
