export default {
  displayName: 'erxes-api-shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js'],
  coverageDirectory: '../../coverage/backend/erxes-api-shared',
  testMatch: ['**/?(*.)+(spec|test).[jt]s'],
};
