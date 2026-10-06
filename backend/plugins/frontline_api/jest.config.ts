const esmDependencies =
  'string-strip-html|codsen-utils|lodash-es|ranges-apply|ranges-merge|ranges-push|ranges-sort|string-collapse-leading-whitespace|string-trim-spaces-only|string-left-right';

export default {
  displayName: 'frontline-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false },
    ],
  },
  // The reply adapter uses string-strip-html and its ESM-only dependencies.
  transformIgnorePatterns: [
    `node_modules/(?!\\.pnpm/|(?:${esmDependencies})/)`,
    `node_modules/\\.pnpm/(?!(?:${esmDependencies})@)`,
  ],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
    '^@/(.*)$': '<rootDir>/src/modules/$1',
    '^erxes-api-shared/(.*)$': '<rootDir>/../../erxes-api-shared/src/$1',
  },
  testMatch: ['<rootDir>/src/**/__tests__/*.spec.ts'],
  coverageDirectory: '../../../coverage/backend/plugins/frontline_api',
};
