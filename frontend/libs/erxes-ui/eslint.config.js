const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      // erxes-ui wraps Radix primitives; the AGENTS.md rule-1 ban is for consumers.
      '@typescript-eslint/no-restricted-imports': 'off',
      'no-console': [
        'warn',
        { allow: ['group', 'groupCollapsed', 'groupEnd'] },
      ],
    },
  },
];
