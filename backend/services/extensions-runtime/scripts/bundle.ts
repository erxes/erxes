import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { build } from 'esbuild';
import { collectExtension } from 'erxes-sdk';
import { LIMITS } from '../src/limits';

// workerd loads every worker version into memory, so a bundle over the limit
// is almost always an accident, like `import { z } from 'zod'` pulling in
// every zod locale (900 KB) where `import * as z from 'zod'` costs 90 KB.
const WORKER_BUDGET_BYTES = LIMITS.workerBytes;

// Bundles an extension's server/ into one worker module. The SDK's `serve`
// wraps the module, so authors only write named exports.
export const bundleExtension = async (extDir: string) => {
  const result = await build({
    stdin: {
      contents: [
        "import * as mod from './server';",
        "import { serve } from 'erxes-sdk/worker';",
        'export default serve(mod);',
      ].join('\n'),
      resolveDir: extDir,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    mainFields: ['module', 'main'],
    target: 'es2022',
    minify: true,
    external: ['cloudflare:workers'],
    write: false,
    metafile: true,
  });
  const code = result.outputFiles[0].text;

  if (code.length > WORKER_BUDGET_BYTES) {
    const inputs = Object.entries(
      Object.values(result.metafile.outputs)[0].inputs,
    )
      .sort(([, a], [, b]) => b.bytesInOutput - a.bytesInOutput)
      .slice(0, 5)
      .map(
        ([file, { bytesInOutput }]) =>
          `  ${Math.round(bytesInOutput / 1024)} KB  ${file}`,
      );

    throw new Error(
      `worker is ${Math.round(code.length / 1024)} KB, over the ${
        WORKER_BUDGET_BYTES / 1024
      } KB budget. Largest inputs:\n${inputs.join('\n')}`,
    );
  }

  return code;
};

// What the runtime needs to know about an extension without running it in
// workerd: names only. id and version come from package.json; functions,
// collections, pinned contracts and indexes from importing server/ in Node.
export const describeExtension = async (extDir: string) => {
  const pkg = JSON.parse(
    await readFile(path.join(extDir, 'package.json'), 'utf8'),
  ) as { name: string; version: string };
  const mod = (await import(path.resolve(extDir, 'server/index.ts'))) as Record<
    string,
    unknown
  >;
  const { schema, permissions, uses, indexes, functions } =
    collectExtension(mod);

  return {
    id: pkg.name,
    version: pkg.version,
    functions: [...functions.keys()],
    collections: Object.keys(schema),
    permissions,
    functionPermissions: Object.fromEntries(
      [...functions].map(([path, fn]) => [path, fn.permission]),
    ),
    uses,
    indexes,
  };
};

// The Module Federation remote name, from the manifest the MF plugin writes.
export const uiRemoteName = async (distDir: string) => {
  const manifest = JSON.parse(
    await readFile(path.join(distDir, 'mf-manifest.json'), 'utf8'),
  ) as { name: string };

  return manifest.name;
};
