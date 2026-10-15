const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
  { ignores: ['src/gql/**'] },
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'graphql-tag', message: "Use gql() from '~/gql'." },
            {
              name: '@apollo/client',
              importNames: ['gql'],
              message: "Use gql() from '~/gql'.",
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[typeArguments]:matches([callee.name=/^use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)$/], [callee.property.name=/^use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)$/])',
          message: 'Infer Apollo types from the generated document.',
        },
        {
          selector:
            "CallExpression[typeArguments]:matches([callee.name='subscribeToMore'], [callee.property.name='subscribeToMore'])",
          message: 'Infer subscription types from the generated document.',
        },
      ],
    },
  },
];
