const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

module.exports = [
  { ignores: ['src/gql/**'] },
  ...baseConfig,
  ...nx.configs['flat/react'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'graphql-tag',
              message:
                "Use `import { gql } from '~/gql'` so codegen picks the document up.",
            },
            {
              name: '@apollo/client',
              importNames: ['gql'],
              message:
                "Use `import { gql } from '~/gql'` so codegen picks the document up.",
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[typeArguments]:matches([callee.name=/^use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)$/], [callee.property.name=/^use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)$/])',
          message:
            'Do not pass type arguments to Apollo hooks; infer them from a document created with gql() from ~/gql.',
        },
        {
          selector:
            "CallExpression[typeArguments]:matches([callee.name='subscribeToMore'], [callee.property.name='subscribeToMore'])",
          message:
            'Do not pass type arguments to subscribeToMore; infer them from a document created with gql() from ~/gql.',
        },
      ],
    },
  },
];
