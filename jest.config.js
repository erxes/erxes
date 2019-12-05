module.exports = {
  roots: ['<rootDir>/src/__tests__'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testRegex: '/__tests__/.*\\.(ts|js)$',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  modulePathIgnorePatterns: ['utils.ts', 'setup.ts', 'conversationCronJob.test.ts', 'coverage/'],
  coverageDirectory: 'src/__tests__/coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/db/models/**',
    '!src/db/models/Robot.ts',
    '!src/db/models/definitions/**',
    'src/data/resolvers/**',
    '!src/data/resolvers/customScalars.ts',
    '!src/data/resolvers/mutations/robot.ts',
    '!src/data/resolvers/queries/insights.ts',
    '!src/data/resolvers/queries/robot.ts',
    '!src/data/resolvers/subscriptions/**',
  ],
  coverageThreshold: {
    global: {
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json',
    },
  },
};