module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',

  // The root directory that Jest should scan for tests and modules
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src'],

  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // An array of regexp pattern strings that are matched against all source paths
  transformIgnorePatterns: [
    '/node_modules/',
    '\\.pnp\\.[^\\/]+$'
  ],

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/config/',
    '/dist/'
  ],

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover',
    'html'
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // An array of regexp pattern strings that are matched against all modules before they are loaded
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // The paths to modules that run some code to configure or set up the testing environment
  setupFiles: ['<rootDir>/src/tests/setup.js'],

  // A list of paths to modules that run some code to configure or set up the testing framework
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupAfterEnv.js'],

  // The maximum amount of workers used to run your tests
  maxWorkers: '50%',

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Allows you to use a custom runner instead of Jest's default test runner
  // testRunner: 'jest-circus/runner',

  // This option allows use of a custom test runner
  runner: 'jest-runner',

  // This option sets the URL for the jsdom environment
  testURL: 'http://localhost',

  // An array of regexp pattern strings that are matched against all source file paths before re-running tests
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,

  // An array of regexp patterns that are matched against all source file paths before re-running tests
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // This option allows you to use custom reporters to output test results
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

  // Global configuration for Jest
  globals: {
    __DEV__: true
  },

  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/tests/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/tests/__mocks__/styleMock.js'
  },

  // An array of regexp pattern strings, matched against all module paths before those paths are to be considered 'visible' to the module loader
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/'
  ],

  // A preset that is used as a base for Jest's configuration
  preset: '@shelf/jest-mongodb',

  // Run tests with increased timeout
  testTimeout: 30000,

  // Automatically restore mock state between every test
  restoreMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*/types.js',
    '!src/**/*/constants.js',
    '!src/**/*/styles.js',
    '!src/**/*/index.js',
    '!src/**/*/setup*.js',
    '!src/**/*/serviceWorker.js',
    '!src/**/*/reportWebVitals.js',
    '!src/**/*/test-utils.js'
  ]
};
