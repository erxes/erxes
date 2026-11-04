import { randomUUID } from 'node:crypto';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { checkExtensionSchema } from '../schema';
import type { AnyExtension } from '../server';
import { readPackage, SDK_ALIAS } from './paths';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isExtension = (value: unknown): value is AnyExtension =>
  isRecord(value) &&
  isRecord(value.resolvers) &&
  isRecord(value.collections) &&
  isRecord(value.permissions) &&
  isRecord(value.fieldPermissions);

// server/index.ts's `extension`, read in Node. Bundled first, like the
// worker, so it resolves the same modules the worker does.
export const loadExtension = async (extDir: string) => {
  const result = await build({
    entryPoints: [path.join(extDir, 'server/index.ts')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    alias: SDK_ALIAS,
    write: false,
    logLevel: 'silent',
  });
  const file = path.join(tmpdir(), `erxes-ext-${randomUUID()}.mjs`);
  await writeFile(file, result.outputFiles[0].text);

  try {
    const mod: { extension?: unknown } = await import(pathToFileURL(file).href);

    if (!isExtension(mod.extension)) {
      throw new Error(
        'server/index.ts must export `extension`, made with defineExtension',
      );
    }

    return mod.extension;
  } finally {
    await rm(file, { force: true });
  }
};

// What the runtime needs to know about an extension without running it in
// workerd: its schema, field names, permissions, collections and the erxes
// operations codegen persisted. Fails on a schema install would refuse.
export const describeExtension = async (extDir: string) => {
  const { id, version } = await readPackage(extDir);
  const extension = await loadExtension(extDir);
  const graphql = {
    types: extension.types ?? '',
    queries: extension.queries ?? '',
    mutations: extension.mutations ?? '',
  };
  const resolvers = Object.fromEntries(
    Object.entries(extension.resolvers).map(([type, fields]) => [
      type,
      Object.keys(fields ?? {}),
    ]),
  );
  const { typeDefs, problems } = checkExtensionSchema({
    id,
    graphql,
    resolvers,
    permissions: extension.permissions,
    fieldPermissions: extension.fieldPermissions,
  });

  if (problems.length > 0) {
    throw new Error(
      `the extension's GraphQL schema would be refused:\n${problems
        .map((problem) => `  - ${problem}`)
        .join('\n')}`,
    );
  }

  const operations: Record<string, string> = await readFile(
    path.join(extDir, 'server/gql/persisted-documents.json'),
    'utf8',
  ).then(
    (json) => JSON.parse(json),
    () => ({}),
  );

  return {
    typeDefs,
    body: {
      id,
      version,
      graphql,
      resolvers,
      collections: Object.keys(extension.collections),
      indexes: Object.fromEntries(
        Object.entries(extension.indexes ?? {}).flatMap(([name, list]) =>
          list ? [[name, list]] : [],
        ),
      ),
      permissions: extension.permissions,
      fieldPermissions: extension.fieldPermissions,
      operations,
    },
  };
};
