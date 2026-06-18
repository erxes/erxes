/* eslint-disable */
export default {
  displayName: 'mastra-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // isolatedModules = transpile-only: ts-jest's full per-worker type program
    // OOMs (2GB heap) on files whose import graph reaches @mastra/core +
    // connectionResolvers. Types are enforced by `pnpm build` (tsc), not here.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  coverageDirectory: '../../../coverage/backend/plugins/erxes-agent_api',
};
