import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { bundleWorker } from './bundle';
import { codegen } from './codegen';
import { buildUi } from './ui';

export type BuildOptions = { schema?: string };

// The one file Settings > Extensions uploads, and `install` sends: the
// worker bundle, the UI files and what the runtime needs to know about them.
// Written to dist/<id>-<version>.erxext.json.
export const buildExtension = async (
  extDir: string,
  { schema }: BuildOptions = {},
) => {
  const {
    described: { body },
  } = await codegen(extDir, schema);
  const code = await bundleWorker(extDir);
  const ui = await buildUi(extDir, body.id);
  const bundle = { ...body, code, ...(ui && { ui }) };
  const file = path.join(
    extDir,
    'dist',
    `${bundle.id}-${bundle.version}.erxext.json`,
  );
  const json = JSON.stringify(bundle);

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, json);

  return { bundle, file, bytes: json.length };
};
