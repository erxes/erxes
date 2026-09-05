module.exports = {
  displayName: 'operation-agent-tools',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/trpc/__tests__/*.spec.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { isolatedModules: true, esModuleInterop: true },
    }],
  },
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
};
