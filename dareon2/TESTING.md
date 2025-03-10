# Testing Documentation

## Overview

The project implements a comprehensive testing strategy across multiple layers:

- **Unit Tests** (Jest)
  - Backend: Testing individual components, controllers, and utilities
  - Frontend: Testing React components and utilities
- **Integration Tests** (Jest + Supertest)
  - Backend: Testing API endpoints and database interactions
  - Frontend: Testing component interactions and state management
- **End-to-End Tests** (Cypress)
  - Testing complete user flows and scenarios
  - Browser-based testing of the full application

## Test Structure

```
dareon2/
├── backend/
│   ├── src/
│   │   └── tests/
│   │       ├── auth.test.js        # Authentication tests
│   │       ├── file.test.js        # File management tests
│   │       ├── ai.test.js          # AI functionality tests
│   │       ├── billing.test.js     # Billing system tests
│   │       ├── setup.js            # Test setup configuration
│   │       ├── setupAfterEnv.js    # Post-environment setup
│   │       └── utils/
│   │           └── testSetup.js    # Common test utilities
│   ├── jest.config.js              # Jest configuration
│   └── reporter-config.json        # Test reporter configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── __tests__/         # Component tests
│   │   ├── pages/
│   │   │   └── __tests__/         # Page component tests
│   │   └── tests/
│   │       ├── setupTests.js       # Test setup
│   │       ├── transforms/         # Test transformers
│   │       └── __mocks__/         # Test mocks
│   ├── cypress/
│   │   ├── e2e/                   # End-to-end tests
│   │   │   ├── auth.cy.js
│   │   │   ├── files.cy.js
│   │   │   ├── ai-assistant.cy.js
│   │   │   └── billing.cy.js
│   │   └── support/               # Cypress support files
│   ├── jest.config.js             # Jest configuration
│   ├── cypress.config.js          # Cypress configuration
│   └── reporter-config.json       # Test reporter configuration
```

## Running Tests

### All Tests
```bash
npm test                  # Run all tests
npm run test:coverage    # Run all tests with coverage
```

### Backend Tests
```bash
npm run test:backend     # Run backend tests
npm run test:backend -- --watch    # Run in watch mode
npm run test:backend -- --coverage # Run with coverage
```

### Frontend Tests
```bash
npm run test:frontend    # Run frontend unit/integration tests
npm run test:frontend -- --watch   # Run in watch mode
npm run test:frontend -- --coverage # Run with coverage
```

### End-to-End Tests
```bash
npm run test:e2e        # Run all E2E tests
npm run cypress:open    # Open Cypress Test Runner
npm run cypress:run     # Run Cypress tests headlessly
```

## Test Reports

### Coverage Reports
Coverage reports are generated in the `coverage` directory after running tests with the `--coverage` flag.

```bash
npm run report:coverage  # Generate consolidated coverage report
```

### Test Reports
Test execution reports are generated using Mochawesome:

```bash
npm run report:backend   # Generate backend test report
npm run report:frontend  # Generate frontend test report
```

Reports can be found in:
- Backend: `backend/reports/mochawesome/mochawesome.html`
- Frontend: `frontend/reports/mochawesome/mochawesome.html`

## Writing Tests

### Backend Tests

1. Unit Tests:
```javascript
describe('Module Name', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Test
  });
});
```

2. Integration Tests:
```javascript
const request = require('supertest');
const app = require('../index');

describe('API Endpoint', () => {
  it('should handle request', async () => {
    const res = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
  });
});
```

### Frontend Tests

1. Component Tests:
```javascript
import { render, screen } from '@testing-library/react';
import Component from '../Component';

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

2. E2E Tests:
```javascript
describe('Feature', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should work end-to-end', () => {
    cy.visit('/page');
    cy.get('[data-testid=element]').click();
    cy.url().should('include', '/next-page');
  });
});
```

## Best Practices

1. Test Organization:
   - Group related tests using `describe` blocks
   - Use clear, descriptive test names
   - Follow the AAA pattern (Arrange, Act, Assert)

2. Test Coverage:
   - Aim for 80% or higher coverage
   - Focus on critical business logic
   - Test edge cases and error scenarios

3. Mocking:
   - Mock external dependencies
   - Use meaningful mock data
   - Clean up mocks after tests

4. Assertions:
   - Make specific assertions
   - Test both positive and negative cases
   - Verify state changes

5. Test Isolation:
   - Reset state between tests
   - Avoid test interdependence
   - Clean up resources after tests

## Continuous Integration

Tests are automatically run in CI/CD pipeline:
- On pull requests
- Before deployments
- Nightly for full test suite

### CI Configuration
```yaml
test:
  script:
    - npm install
    - npm run test:ci
  artifacts:
    reports:
      coverage: coverage/
      junit: reports/junit/
```

## Troubleshooting

Common issues and solutions:

1. Tests timing out:
   - Increase timeout in test config
   - Check for async operations
   - Verify test cleanup

2. Flaky tests:
   - Add retry logic
   - Check for race conditions
   - Ensure proper test isolation

3. Coverage issues:
   - Verify file inclusion/exclusion
   - Check transform configurations
   - Update coverage thresholds

## Contributing

When adding new tests:
1. Follow existing patterns
2. Update documentation
3. Verify coverage
4. Run full test suite
5. Update CI configuration if needed
