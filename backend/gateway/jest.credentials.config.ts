export default {
  displayName: 'gateway-credentials',
  rootDir: '../..',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: '<rootDir>/backend/gateway/tsconfig.json' },
    ],
  },
  moduleNameMapper: {
    '^erxes-api-shared/utils$':
      '<rootDir>/backend/erxes-api-shared/src/utils/credential-privacy.ts',
  },
  modulePathIgnorePatterns: ['/dist/', '/.nx/'],
  testMatch: [
    '<rootDir>/backend/gateway/src/middlewares/__tests__/credentialPrivacy.spec.ts',
  ],
};
