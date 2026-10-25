export default {
  displayName: 'gateway',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // Transpile-only; `pnpm build` (tsc) enforces types.
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
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  forceExit: true,
  coverageDirectory: '../../coverage/backend/gateway',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
