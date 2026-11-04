import { build } from 'esbuild';
import { SDK_ALIAS } from './paths';

// workerd keeps every loaded worker version in memory, and the runtime
// refuses bigger builds. Over it is almost always an accident, like
// `import { z } from 'zod'` pulling in every zod locale where
// `import * as z from 'zod'` costs a tenth of it.
const WORKER_BUDGET_BYTES = 300 * 1024;

// One worker module from server/. The SDK's `serve` wraps `extension`, so
// authors only write named exports.
export const bundleWorker = async (extDir: string) => {
  const result = await build({
    stdin: {
      contents: [
        "import { extension } from './server';",
        "import { serve } from 'erxes-sdk/worker';",
        'export default serve(extension);',
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
    alias: SDK_ALIAS,
    external: ['cloudflare:workers'],
    write: false,
    metafile: true,
    logLevel: 'silent',
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
