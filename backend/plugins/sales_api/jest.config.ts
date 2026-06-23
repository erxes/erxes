/* eslint-disable */
export default {
  displayName: 'sales-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // isolatedModules = transpile-only. Full type-checking is enforced by
    // `pnpm build` (tsc); the spec program only needs to run the tests.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  coverageDirectory: '../../../coverage/backend/plugins/sales_api',
};
