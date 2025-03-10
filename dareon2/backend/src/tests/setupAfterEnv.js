// This file runs after the test environment is set up but before each test file

// Import test utilities
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Extend Jest matchers
expect.extend({
  // Custom matcher to check if a value is a valid MongoDB ObjectId
  toBeValidObjectId(received) {
    const pass = mongoose.Types.ObjectId.isValid(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid ObjectId`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid ObjectId`,
        pass: false,
      };
    }
  },

  // Custom matcher to check if an object has all required properties
  toHaveRequiredProperties(received, properties) {
    const missing = properties.filter(prop => !(prop in received));
    const pass = missing.length === 0;
    if (pass) {
      return {
        message: () =>
          `expected object not to have properties: ${properties.join(', ')}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected object to have properties: ${missing.join(', ')}`,
        pass: false,
      };
    }
  },

  // Custom matcher to check if a date is within a range
  toBeWithinDateRange(received, start, end) {
    const date = new Date(received);
    const pass = date >= start && date <= end;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within date range ${start} - ${end}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within date range ${start} - ${end}`,
        pass: false,
      };
    }
  },

  // Custom matcher to check if a value is a valid JWT token
  toBeValidJWT(received) {
    const jwtPattern = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/;
    const pass = jwtPattern.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid JWT token`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid JWT token`,
        pass: false,
      };
    }
  }
});

// Global test hooks
beforeAll(async () => {
  // Additional setup before all tests if needed
});

afterAll(async () => {
  // Additional cleanup after all tests if needed
});

beforeEach(async () => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(async () => {
  // Additional cleanup after each test if needed
});

// Global error handler for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

// Global test utilities
global.createMockUser = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password123!',
  role: 'user',
  isEmailVerified: true,
  ...overrides
});

global.createMockSubscription = (overrides = {}) => ({
  type: 'basic',
  status: 'active',
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
  ...overrides
});

global.createMockFile = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  originalName: 'test.pdf',
  fileName: 'test-123.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  path: '/test/path/test-123.pdf',
  uploadDate: new Date(),
  userId: new mongoose.Types.ObjectId(),
  ...overrides
});

// Helper function to wait for a specified time
global.wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if two dates are the same (ignoring milliseconds)
global.areDatesEqual = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getTime() === d2.getTime();
};

// Helper function to create a mock request object
global.createMockRequest = (overrides = {}) => ({
  user: createMockUser(),
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides
});

// Helper function to create a mock response object
global.createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  };
  return res;
};

// Helper function to create a mock next function
global.createMockNext = () => jest.fn();
