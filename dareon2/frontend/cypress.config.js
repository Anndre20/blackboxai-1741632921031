const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        // Add custom tasks here
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        }
      });
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 30000,
    watchForFileChanges: true,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0
    },
    env: {
      apiUrl: 'http://localhost:5000/api',
      coverage: false
    },
    experimentalStudio: true,
    experimentalSessionAndOrigin: true,
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    excludeSpecPattern: ['*.hot-update.js'],
    testIsolation: true,
    numTestsKeptInMemory: 50,
    experimentalMemoryManagement: true,
    blockHosts: [],
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json'
    },
    downloadsFolder: 'cypress/downloads',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    experimentalModifyObstructiveThirdPartyCode: true,
    component: {
      devServer: {
        framework: 'create-react-app',
        bundler: 'webpack'
      },
      specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
      supportFile: 'cypress/support/component.js'
    }
  },
  // Configure retry attempts for specific events
  retries: {
    // Configure retry attempts for `cy.visit()`
    runMode: 2,
    openMode: 0
  },
  // Configure which hosts to allow/block network requests to
  blockHosts: [
    '*.google-analytics.com',
    '*.doubleclick.net',
    '*.google.com',
    '*.facebook.com'
  ],
  // Configure how Cypress handles files
  fileServerFolder: '.',
  fixturesFolder: 'cypress/fixtures',
  // Configure how Cypress handles videos
  video: false,
  videoCompression: 32,
  videoUploadOnPasses: false,
  // Configure how Cypress handles screenshots
  screenshotOnRunFailure: true,
  screenshotsFolder: 'cypress/screenshots',
  // Configure test timeouts
  defaultCommandTimeout: 10000,
  execTimeout: 60000,
  taskTimeout: 60000,
  pageLoadTimeout: 30000,
  requestTimeout: 10000,
  responseTimeout: 30000,
  // Configure viewport
  viewportWidth: 1280,
  viewportHeight: 720,
  // Configure test retries
  retries: {
    runMode: 2,
    openMode: 0
  },
  // Configure experimental features
  experimentalStudio: true,
  experimentalSessionAndOrigin: true,
  experimentalSourceRewriting: true,
  experimentalModifyObstructiveThirdPartyCode: true,
  // Configure component testing
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
});
