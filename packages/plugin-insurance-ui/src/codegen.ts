import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:4000/graphql',
  documents: 'src/modules/**/graphql/*.ts',
  generates: {
    'src/gql/types.ts': {
      plugins: ['typescript']
    },
    'src/': {
      preset: 'near-operation-file',
      presetConfig: { extension: '.types.tsx', baseTypesPath: 'gql/types.ts' },
      plugins: ['typescript-operations'],
      config: { withHooks: true }
    }
  }
};

export default config;
