module.exports = {
  roots: ['<rootDir>/src/__tests__'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '/__tests__/.*\\.(ts|js)$',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  modulePathIgnorePatterns: ['setup.ts', 'coverage/'],
  coverageDirectory: 'src/__tests__/coverage/',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/nylas/**',
    'src/gmail/**',
    'src/twitter/**',
    'src/whatsapp/**',
    'src/smooch/**',
    '!src/nylas/api.ts',
    '!src/nylas/controller.ts',
    '!src/gmail/api.ts',
    '!src/gmail/controller.ts',
    '!src/twitter/api.ts'
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json'
    }
  },
  coverageThreshold: {
    global: {
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
