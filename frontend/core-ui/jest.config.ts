export default {
  displayName: 'core-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  // `ai` and its @ai-sdk dependencies ship ESM only. Transform them like
  // source so code and tests import the SDK's own helpers.
  transformIgnorePatterns: [
    '/node_modules/(?!(\\.pnpm|ai|@ai-sdk|@workflow|@standard-schema|eventsource-parser|@opentelemetry)(/|@))',
  ],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/core',
};
