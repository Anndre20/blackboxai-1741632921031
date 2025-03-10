const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  }
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
  if (mongod) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
};

/**
 * Setup test database hooks
 */
module.exports.setupTestDB = () => {
  beforeAll(async () => {
    await module.exports.connect();
  });

  afterEach(async () => {
    await module.exports.clearDatabase();
  });

  afterAll(async () => {
    await module.exports.closeDatabase();
  });
};

/**
 * Create a test user
 */
module.exports.createTestUser = async (User, userData = {}) => {
  const defaultUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Password123!',
    companyName: 'Test Company',
    role: 'user',
    isEmailVerified: true,
    subscription: {
      type: 'free',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
    }
  };

  return await User.create({ ...defaultUser, ...userData });
};

/**
 * Generate valid JWT token for test user
 */
module.exports.generateTestToken = (user) => {
  return user.getSignedJwtToken();
};

/**
 * Create test file data
 */
module.exports.createTestFileData = (overrides = {}) => {
  return {
    originalName: 'test-file.pdf',
    fileName: 'test-file-123.pdf',
    mimeType: 'application/pdf',
    size: 1024 * 1024, // 1MB
    path: '/test/path/test-file-123.pdf',
    uploadDate: new Date(),
    metadata: {
      pageCount: 1,
      author: 'Test Author',
      creationDate: new Date()
    },
    ...overrides
  };
};

/**
 * Mock email service
 */
module.exports.mockEmailService = () => {
  jest.mock('../../utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
  }));
};

/**
 * Mock Stripe service
 */
module.exports.mockStripeService = () => {
  jest.mock('stripe', () => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
      update: jest.fn().mockResolvedValue({}),
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
    }
  }));
};

/**
 * Mock logger
 */
module.exports.mockLogger = () => {
  jest.mock('../../utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }));
};

/**
 * Create test subscription data
 */
module.exports.createTestSubscriptionData = (overrides = {}) => {
  return {
    type: 'basic',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    stripeCustomerId: 'cus_test123',
    stripeSubscriptionId: 'sub_test123',
    ...overrides
  };
};

/**
 * Mock integration services
 */
module.exports.mockIntegrationServices = () => {
  jest.mock('../../services/microsoft.service', () => ({
    syncEmails: jest.fn().mockResolvedValue({ success: true }),
    syncCalendar: jest.fn().mockResolvedValue({ success: true }),
    syncContacts: jest.fn().mockResolvedValue({ success: true })
  }));

  jest.mock('../../services/google.service', () => ({
    syncGmail: jest.fn().mockResolvedValue({ success: true }),
    syncGoogleCalendar: jest.fn().mockResolvedValue({ success: true })
  }));

  jest.mock('../../services/timetree.service', () => ({
    syncEvents: jest.fn().mockResolvedValue({ success: true }),
    updateCalendar: jest.fn().mockResolvedValue({ success: true })
  }));
};

/**
 * Mock file system operations
 */
module.exports.mockFileSystem = () => {
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
};
