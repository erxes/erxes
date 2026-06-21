/* eslint-disable */
export default {
  displayName: 'erxes-api-shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // isolatedModules = transpile-only. Types are enforced by `pnpm build`
    // (tsc), not the test runner; this keeps the worker memory bounded.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  // The mongodb-memory-server child process can outlive Jest's graceful-exit
  // window even with correct afterAll teardown; force exit so CI never hangs.
  forceExit: true,
  coverageDirectory: '../../coverage/backend/erxes-api-shared',
};
