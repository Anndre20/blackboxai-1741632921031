module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: '.',

  // The test environment that will be used for testing
  testEnvironment: 'jsdom',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.{js,jsx,ts,tsx}',
    '**/?(*.)+(spec|test).{js,jsx,ts,tsx}'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],

  // Setup files that will be run before each test
  setupFiles: [
    '<rootDir>/src/tests/setupTests.js'
  ],

  // Setup files that will be run after Jest is loaded
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect'
  ],

  // Transform files with babel-jest
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.css$': '<rootDir>/src/tests/transforms/cssTransform.js',
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '<rootDir>/src/tests/transforms/fileTransform.js'
  },

  // An array of regexp pattern strings that are matched against all source file paths
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|ts|tsx)$',
    '^.+\\.module\\.(css|sass|scss)$'
  ],

  // Module name mapper for handling imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/tests/__mocks__/fileMock.js'
  },

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/',
    '/build/',
    'src/index.js',
    'src/reportWebVitals.js',
    'src/setupTests.js'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
    'html'
  ],

  // Coverage threshold enforcement
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Collect coverage from these directories
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*/types.{js,jsx,ts,tsx}',
    '!src/**/*/constants.{js,jsx,ts,tsx}',
    '!src/**/*/styles.{js,jsx,ts,tsx}',
    '!src/**/*/index.{js,jsx,ts,tsx}',
    '!src/**/*/setup*.{js,jsx,ts,tsx}',
    '!src/**/*/serviceWorker.{js,jsx,ts,tsx}',
    '!src/**/*/reportWebVitals.{js,jsx,ts,tsx}',
    '!src/**/*/test-utils.{js,jsx,ts,tsx}'
  ],

  // The maximum amount of workers used to run tests
  maxWorkers: '50%',

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Custom reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports/junit',
        outputName: 'js-test-results.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // Global configuration
  globals: {
    __DEV__: true
  },

  // Module file extensions
  moduleFileExtensions: [
    'web.js',
    'js',
    'web.ts',
    'ts',
    'web.tsx',
    'tsx',
    'json',
    'web.jsx',
    'jsx',
    'node'
  ],

  // Test timeout
  testTimeout: 10000,

  // Automatically restore mock state between every test
  restoreMocks: true,

  // Module paths
  modulePaths: ['<rootDir>/src'],

  // Browser environment configuration
  testEnvironmentOptions: {
    url: 'http://localhost'
  },

  // Custom resolver
  resolver: undefined,

  // Test sequence randomization
  randomize: true
};
