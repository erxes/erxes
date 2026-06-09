/* eslint-disable */
export default {
  displayName: 'mastra-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  coverageDirectory: '../../../coverage/backend/plugins/mastra_api',
};
