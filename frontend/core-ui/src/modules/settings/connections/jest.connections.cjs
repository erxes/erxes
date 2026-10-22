const path = require('node:path');

module.exports = {
  displayName: 'core-ui-connections',
  rootDir: path.resolve(__dirname, '../../../../../..'),
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: [
    '<rootDir>/.nx/',
    '<rootDir>/dist/',
    '<rootDir>/backend/.*/dist/',
    '<rootDir>/frontend/.*/dist/',
  ],
  testMatch: [
    '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/**/*.test.ts',
    '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/**/*.test.tsx',
    '<rootDir>/frontend/core-ui/src/providers/credentialPrivacy.test.ts',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/setup.ts',
  ],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig:
          '<rootDir>/frontend/core-ui/src/modules/settings/connections/tsconfig.spec.json',
      },
    ],
  },
  moduleNameMapper: {
    '^erxes-ui/components$':
      '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/native-ui.ts',
    '^erxes-ui$':
      '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/native-ui.ts',
    '^erxes-ui/lib$': '<rootDir>/frontend/libs/erxes-ui/src/lib/index.ts',
    '^erxes-ui/(.*)$': '<rootDir>/frontend/libs/erxes-ui/src/$1',
    '^ui-modules$':
      '<rootDir>/frontend/core-ui/src/modules/settings/connections/__tests__/workspace-ui.tsx',
  },
  clearMocks: true,
};
