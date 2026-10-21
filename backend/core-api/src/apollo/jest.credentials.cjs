module.exports = {
  displayName: 'core-api-credential-privacy',
  rootDir: __dirname,
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../../tsconfig.json' }],
  },
  moduleNameMapper: {
    '^erxes-api-shared/utils$':
      '<rootDir>/../../../erxes-api-shared/src/utils/credential-privacy.ts',
  },
  testMatch: ['<rootDir>/__tests__/credentialPrivacy.spec.ts'],
};
