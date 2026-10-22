module.exports = {
  displayName: 'core-api-credentials',
  rootDir: __dirname,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/../../$1',
    '^@/(.*)$': '<rootDir>/../$1',
  },
  clearMocks: true,
};
