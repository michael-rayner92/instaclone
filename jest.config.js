module.exports = {
  collectCoverageFrom: [
    '!<rootDir>/src/App.js',
    '!<rootDir>/src/index.js',
    '!<rootDir>/src/seed.js',
    '!<rootDir>/src/fixtures/*.js',
    '!<rootDir>/src/hooks/*.js',
    '!<rootDir>/src/helpers/*.js',
    '!<rootDir>/src/services/firebase.js'
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  coverageReporters: ['html', 'text']
};
