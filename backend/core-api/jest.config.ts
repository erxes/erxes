export default {
  displayName: 'core-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // Transpile-only (isolatedModules in tsconfig.spec.json); `pnpm build` checks types.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
    '^erxes-api-shared/(.*)$': '<rootDir>/../erxes-api-shared/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/src/**/*.test.ts'],
  coverageDirectory: '../../coverage/backend/core-api',
};
