// Builds an extension into the one file Settings > Extensions uploads: the
// worker bundle, the UI files and what the runtime needs to know about it.
import { execFile } from 'node:child_process';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { bundleExtension, describeExtension, uiRemoteName } from './bundle';
import { buildExtensionCss } from './ext-css';

const listFiles = async (dir: string, prefix = ''): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? listFiles(path.join(dir, entry.name), `${prefix}${entry.name}/`)
        : [`${prefix}${entry.name}`],
    ),
  );
  return nested.flat();
};

const readUi = async (distDir: string) => {
  const exists = await stat(path.join(distDir, 'remoteEntry.js')).then(
    () => true,
    () => false,
  );

  if (!exists) {
    return undefined;
  }

  // Source maps and build stats are for the developer, not the browser.
  const files = (await listFiles(distDir)).filter(
    (file) => !file.endsWith('.map') && file !== 'mf-stats.json',
  );
  const contents = await Promise.all(
    files.map(async (file) => [
      file,
      (await readFile(path.join(distDir, file))).toString('base64'),
    ]),
  );

  return {
    remote: await uiRemoteName(distDir),
    files: Object.fromEntries(contents),
  };
};

const exists = (file: string) =>
  stat(file).then(
    () => true,
    () => false,
  );

// CSS first, because the UI build inlines it.
const buildUi = async (extDir: string) => {
  if (!(await exists(path.join(extDir, 'ui', 'rspack.config.mjs')))) {
    return;
  }

  await buildExtensionCss(extDir);
  await promisify(execFile)(
    'npx',
    ['rspack', 'build', '-c', 'ui/rspack.config.mjs'],
    {
      cwd: extDir,
    },
  );
};

export const packageExtension = async (extDir: string) => {
  await buildUi(extDir);

  const description = await describeExtension(extDir);
  const code = await bundleExtension(extDir);
  const ui = await readUi(path.join(extDir, 'ui', 'dist'));

  return { ...description, code, ui };
};
