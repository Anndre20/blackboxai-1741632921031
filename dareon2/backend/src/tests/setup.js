const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for tests
jest.setTimeout(30000);

// Mock console methods to reduce noise in test output
global.console = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRE = '1h';
process.env.STRIPE_SECRET_KEY = 'test-stripe-secret';
process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';

// Mock external services
jest.mock('../utils/email', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('stripe', () => ({
  customers: {
    create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
    update: jest.fn().mockResolvedValue({}),
    retrieve: jest.fn().mockResolvedValue({})
  },
  subscriptions: {
    create: jest.fn().mockResolvedValue({
      id: 'sub_test123',
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
    }),
    update: jest.fn().mockResolvedValue({}),
    del: jest.fn().mockResolvedValue({})
  },
  paymentMethods: {
    attach: jest.fn().mockResolvedValue({}),
    detach: jest.fn().mockResolvedValue({})
  },
  webhooks: {
    constructEvent: jest.fn().mockReturnValue({
      type: 'test.event',
      data: { object: {} }
    })
  }
}));

// Mock file system
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('test file content')),
    unlink: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({
      size: 1024,
      mtime: new Date()
    })
  }
}));

// Setup MongoDB Memory Server
let mongod;
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Clear database between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Close database connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
  if (mongod) {
    await mongod.stop();
  }
});

// Global test utilities
global.testUtils = {
  // Create test user data
  createTestUserData: (overrides = {}) => ({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Password123!',
    companyName: 'Test Company',
    ...overrides
  }),

  // Create test file data
  createTestFileData: (overrides = {}) => ({
    originalName: 'test.pdf',
    fileName: 'test-123.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    path: '/test/path/test-123.pdf',
    ...overrides
  }),

  // Create test subscription data
  createTestSubscriptionData: (overrides = {}) => ({
    type: 'basic',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ...overrides
  }),

  // Mock request object
  createMockRequest: (overrides = {}) => ({
    user: { id: 'test-user-id' },
    body: {},
    params: {},
    query: {},
    ...overrides
  }),

  // Mock response object
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Add custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
