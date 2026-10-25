export default {
  displayName: 'core-ui',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json|mjs)$)': '@nx/react/plugins/jest',
    '^.+\\.m?[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mjs'],
  // ESM-only packages erxes-ui loads, transformed so tests can render real
  // erxes-ui components. pnpm stores scoped names as `@scope+name`.
  transformIgnorePatterns: [
    'node_modules/(?!(\\.pnpm/)?(@formkit/auto-animate|@formkit\\+auto-animate|prosemirror-highlight|react-merge-refs)[@/])',
  ],
  coverageDirectory: '../../coverage/packages/core',
};
