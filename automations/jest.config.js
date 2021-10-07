module.exports = {
  roots: ['<rootDir>/src/__tests__'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '/__tests__/.*\\.(ts|js)$',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['setup.ts', 'factories.ts', 'coverage/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  // collectCoverage: true,
  // coverageDirectory: 'src/__tests__/coverage/',
  // collectCoverageFrom: ['src/**', '!**/node_modules/**', '!src/__tests__/**'],
  // coverageThreshold: {
  //   global: {
  //     functions: 100,
  //     lines: 100,
  //     statements: 100,
  //   },
  // }
};
