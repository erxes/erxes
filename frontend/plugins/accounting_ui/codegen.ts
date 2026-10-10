import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: [
    '../../../backend/plugins/accounting_api/generated/schema.graphql',
    'schema/platform.graphql',
  ],
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**'],
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
