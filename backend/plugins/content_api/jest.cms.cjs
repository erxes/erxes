const base = require('./jest.postiz.cjs');

module.exports = {
  ...base,
  displayName: 'content-cms',
  testMatch: ['<rootDir>/src/modules/cms/utils/__tests__/*.spec.ts'],
};
