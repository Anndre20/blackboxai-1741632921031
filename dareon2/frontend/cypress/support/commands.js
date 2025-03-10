// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Authentication Commands
Cypress.Commands.add('loginByApi', (email = 'test@example.com', password = 'Password123!') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('registerByApi', (userData = {}) => {
  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
    companyName: 'Test Company'
  };

  const data = { ...defaultData, ...userData };

  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: data
  });
});

// File Management Commands
Cypress.Commands.add('uploadFileByApi', (filePath, options = {}) => {
  cy.fixture(filePath, 'binary')
    .then(Cypress.Blob.binaryStringToBlob)
    .then((blob) => {
      const formData = new FormData();
      formData.append('file', blob, options.fileName || filePath);
      
      return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/files/upload`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: formData
      });
    });
});

// Database Commands
Cypress.Commands.add('resetDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/testing/reset-db`,
    headers: {
      'x-testing-key': Cypress.env('testingKey')
    }
  });
});

// UI Interaction Commands
Cypress.Commands.add('clickOutside', () => {
  cy.get('body').click(0, 0);
});

Cypress.Commands.add('dragAndDrop', { prevSubject: 'element' }, (subject, targetSelector) => {
  cy.wrap(subject)
    .trigger('mousedown', { which: 1 })
    .trigger('mousemove', { clientX: 100, clientY: 100 })
    .get(targetSelector)
    .trigger('mousemove')
    .trigger('mouseup', { force: true });
});

// Form Interaction Commands
Cypress.Commands.add('fillForm', (formData) => {
  Object.entries(formData).forEach(([field, value]) => {
    cy.get(`[data-testid=${field}-input]`).type(value);
  });
});

Cypress.Commands.add('submitForm', (selector = 'form') => {
  cy.get(selector).submit();
});

// Assertion Commands
Cypress.Commands.add('shouldHaveNoConsoleErrors', () => {
  cy.window().then((win) => {
    expect(win.console.error).to.have.callCount(0);
  });
});

Cypress.Commands.add('shouldBeAccessible', () => {
  cy.injectAxe();
  cy.checkA11y();
});

// Navigation Commands
Cypress.Commands.add('navigateByUrl', (url) => {
  cy.window().then((win) => {
    win.history.pushState({}, '', url);
  });
  cy.url().should('include', url);
});

// Local Storage Commands
Cypress.Commands.add('setLocalStorage', (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
});

Cypress.Commands.add('getLocalStorage', (key) => {
  return JSON.parse(window.localStorage.getItem(key));
});

// API Mocking Commands
Cypress.Commands.add('mockApiResponse', (method, url, response) => {
  cy.intercept(method, url, {
    statusCode: 200,
    body: response
  }).as('apiCall');
});

Cypress.Commands.add('mockApiError', (method, url, statusCode = 400, error = {}) => {
  cy.intercept(method, url, {
    statusCode,
    body: error
  }).as('apiError');
});

// Viewport Commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport('iphone-x');
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport('ipad-2');
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

// Wait Commands
Cypress.Commands.add('waitForResponse', (alias) => {
  cy.wait(`@${alias}`).its('response.statusCode').should('eq', 200);
});

Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Screenshot Commands
Cypress.Commands.add('takeScreenshot', (name) => {
  cy.screenshot(name, {
    capture: 'fullPage',
    overwrite: true
  });
});

// Subscription Commands
Cypress.Commands.add('subscribeByApi', (plan = 'basic') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/billing/subscribe`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    },
    body: {
      planId: plan,
      paymentMethodId: 'pm_card_visa'
    }
  });
});

// AI Assistant Commands
Cypress.Commands.add('executeAiCommand', (command) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/ai/command`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    },
    body: { command }
  });
});

// Error Handling Commands
Cypress.Commands.add('ignoreError', (errorMessage) => {
  cy.on('uncaught:exception', (err) => {
    if (err.message.includes(errorMessage)) {
      return false;
    }
  });
});
