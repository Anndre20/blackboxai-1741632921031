// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import 'jest-canvas-mock';
import 'whatwg-fetch';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock IntersectionObserver
class IntersectionObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

window.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
  constructor() {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
  }
}

window.ResizeObserver = ResizeObserver;

// Mock window.matchMedia
window.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Custom test utilities
global.testUtils = {
  // Mock successful API response
  mockApiSuccess: (data) => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    });
  },

  // Mock failed API response
  mockApiError: (error) => {
    return Promise.reject(error);
  },

  // Mock API response with status
  mockApiResponse: (status, data) => {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(data)
    });
  },

  // Create mock user data
  createMockUser: (overrides = {}) => ({
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  }),

  // Create mock auth token
  createMockToken: () => 'mock-jwt-token',

  // Mock file data
  createMockFile: (name = 'test.pdf', type = 'application/pdf', size = 1024) => {
    return new File(['test'], name, { type });
  },

  // Wait for element to be removed
  waitForElementToBeRemoved: async (element) => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(element).not.toBeInTheDocument();
  },

  // Mock date
  mockDate: (isoDate) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
      constructor(...args) {
        if (args.length) {
          return new RealDate(...args);
        }
        return new RealDate(isoDate);
      }
      static now() {
        return new RealDate(isoDate).getTime();
      }
    };
  },

  // Reset mocked date
  resetMockDate: () => {
    global.Date = RealDate;
  }
};

// Add custom matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received);
    return {
      pass,
      message: () => `expected ${received} to be a valid date`,
    };
  },
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    return {
      pass,
      message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

// Mock Intersection Observer callback
const mockIntersectionObserverCallback = jest.fn();

// Create a mock Intersection Observer entry
const mockIntersectionObserverEntry = {
  isIntersecting: true,
  intersectionRatio: 1,
  boundingClientRect: {},
  intersectionRect: {},
  rootBounds: {},
  target: document.createElement('div'),
  time: Date.now(),
};

// Set up global fetch mock
global.fetch = jest.fn();

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});
