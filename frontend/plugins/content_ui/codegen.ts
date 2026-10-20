import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    '../../../backend/gateway/generated/schema.graphql',
    'schema/agent.graphql',
  ],
  documents: [
    'src/**/*.{ts,tsx}',
    '!src/gql/**',
    '!src/**/__tests__/**',
    '!src/**/*.{test,spec}.{ts,tsx}',
  ],
  generates: {
    'src/gql/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false, gqlTagName: 'gql' },
      config: {
        scalars: {
          Date: { input: 'string | Date', output: 'string' },
          JSON: 'unknown',
        },
        enumsAsTypes: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
