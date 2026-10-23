/* eslint-disable */
export default {
  displayName: 'data-extensions-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false },
    ],
  },
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^erxes-api-shared/(.*)$': '<rootDir>/../../erxes-api-shared/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  coverageDirectory: '../../../coverage/backend/services/data-extensions-api',
};
