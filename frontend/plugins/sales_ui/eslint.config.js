const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../../eslint.config.js');

// Same restrictions as the Operation plugin: documents come from gql() in
// ~/gql so codegen types them, and Apollo hooks infer from those documents.
const USE_GENERATED_GQL =
  "Use `import { gql } from '~/gql'` so codegen picks the document up.";
const APOLLO_HOOK =
  '/^use(Query|Mutation|Subscription|LazyQuery|SuspenseQuery)$/';

const noTypeArguments = (callee, target) => ({
  selector: `CallExpression[typeArguments]:matches([callee.name=${callee}], [callee.property.name=${callee}])`,
  message: `Do not pass type arguments to ${target}; infer them from a document created with gql() from ~/gql.`,
});

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
            { name: 'graphql-tag', message: USE_GENERATED_GQL },
            {
              name: '@apollo/client',
              importNames: ['gql'],
              message: USE_GENERATED_GQL,
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        noTypeArguments(APOLLO_HOOK, 'Apollo hooks'),
        noTypeArguments("'subscribeToMore'", 'subscribeToMore'),
      ],
    },
  },
];
