/* eslint-disable */
// Default export required by Jest - do not remove
export default {
  displayName: 'core-api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    // Transpile-only: types are enforced by the project tsconfig via
    // `npx tsc --project tsconfig.json --noEmit`, not by ts-jest here.
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  // @mastra/quickjs's CJS bundle calls `ts_blank_space.default` through
  // esbuild's `__toESM(mod, 1)` helper; for the real ESM-only ts-blank-space
  // that yields the namespace, not the function (packaging bug in
  // @mastra/quickjs — the ESM entry works, but pulling it into jest drags in
  // real-ESM loading and the WASM loader's dynamic imports). Tests therefore
  // map ts-blank-space to a callable CJS stub; the sandboxed programs under
  // test are plain JavaScript, so identity passthrough is equivalent.
  // Production strips types via the real ESM package.
  moduleNameMapper: {
    '^ts-blank-space$':
      '<rootDir>/src/modules/agents/__tests__/__stubs__/ts-blank-space.js',
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
    '^erxes-api-shared/(.*)$': '<rootDir>/../erxes-api-shared/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.test.ts',
    '<rootDir>/src/**/*.spec.ts',
  ],
  forceExit: true,
  coverageDirectory: '../../coverage/backend/core-api',
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
