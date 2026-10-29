export default {
  displayName: 'gateway',
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
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^erxes-api-shared/(.*)$': '<rootDir>/../erxes-api-shared/src/$1',
  },
  // *.spec.ts only: tsconfig.build.json excludes it from the production build
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  forceExit: true,
  coverageDirectory: '../../coverage/backend/gateway',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
