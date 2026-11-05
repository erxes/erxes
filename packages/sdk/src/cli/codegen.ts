import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { generate } from '@graphql-codegen/cli';
import { preset } from '@graphql-codegen/client-preset';
import { describeExtension } from './describe';
import { exists, REPO_DIR } from './paths';

const SCALARS = {
  Date: { input: 'string | Date', output: 'string' },
  JSON: 'unknown',
};

const typesConfig = {
  scalars: SCALARS,
  enumsAsTypes: true,
  useTypeImports: true,
};

// The composed erxes schema: --schema or ERXES_SCHEMA (a file or a URL),
// else the monorepo's, from `pnpm nx run gateway:schema:compose`.
const erxesSchema = async (schema?: string) => {
  const chosen = schema || process.env.ERXES_SCHEMA;

  if (chosen) {
    return /^https?:\/\//.test(chosen) ? chosen : path.resolve(chosen);
  }

  const composed = path.join(
    REPO_DIR,
    'backend/gateway/generated/schema.graphql',
  );

  if (!(await exists(composed))) {
    throw new Error(
      `no erxes schema at ${composed}. Run \`pnpm nx run gateway:schema:compose\`, or pass --schema <file|url>.`,
    );
  }

  return composed;
};

// server/operations/*.graphql, checked against erxes and persisted by hash:
// server/gql/persisted-documents.json is every document a run may send.
const serverCodegen = async (extDir: string, schema?: string) => {
  const operations = path.join(extDir, 'server/operations');
  const out = path.join(extDir, 'server/gql');
  const documents = (await exists(operations))
    ? (await readdir(operations)).filter((file) => file.endsWith('.graphql'))
    : [];

  // No operations: no stale documents from an earlier run either.
  await rm(out, { recursive: true, force: true });

  if (documents.length === 0) {
    return 0;
  }

  await generate(
    {
      schema: await erxesSchema(schema),
      documents: documents.map((file) => path.join(operations, file)),
      silent: true,
      generates: {
        [`${out}/`]: {
          preset,
          presetConfig: {
            fragmentMasking: false,
            persistedDocuments: { hashAlgorithm: 'sha256' },
          },
          config: { ...typesConfig, documentMode: 'string' },
        },
      },
    },
    true,
  );

  return documents.length;
};

// The UI's `gql()` documents, checked against the extension's own schema.
const uiCodegen = async (extDir: string, typeDefs: string) => {
  const out = path.join(extDir, 'ui/src/gql');
  const schemaFile = path.join(out, 'schema.graphql');

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await writeFile(schemaFile, typeDefs);

  await generate(
    {
      schema: schemaFile,
      documents: [
        path.join(extDir, 'ui/src/**/*.{ts,tsx}'),
        `!${path.join(out, '**')}`,
      ],
      ignoreNoDocuments: true,
      silent: true,
      generates: {
        [`${out}/`]: {
          preset,
          presetConfig: { fragmentMasking: false, gqlTagName: 'gql' },
          config: typesConfig,
        },
      },
    },
    true,
  );
};

// Server first: server/index.ts imports the documents it writes, and the UI's
// schema comes from server/index.ts.
export const codegen = async (extDir: string, schema?: string) => {
  const operations = await serverCodegen(extDir, schema);
  const described = await describeExtension(extDir);

  if (await exists(path.join(extDir, 'ui/src'))) {
    await uiCodegen(extDir, described.typeDefs);
  }

  return { operations, described };
};
