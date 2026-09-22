import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const TEMP = resolve(ROOT, '.wrangler', 'bundle.js');

const TARGET = resolve(
  ROOT,
  '..',
  '..',
  'backend',
  'plugins',
  'frontline_api',
  'src',
  'modules',
  'integrations',
  'mail',
  'worker',
  'bundle.generated.ts',
);

const esbuild = resolve(ROOT, '..', '..', 'node_modules', '.bin', 'esbuild');

const result = spawnSync(
  esbuild,
  [
    resolve(ROOT, 'src', 'index.ts'),
    '--bundle',
    '--format=esm',
    '--platform=neutral',
    '--target=es2022',
    '--external:node:*',
    '--minify',
    `--outfile=${TEMP}`,
  ],
  { stdio: ['inherit', 'inherit', 'inherit'] },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const script = await readFile(TEMP, 'utf8');
const version = createHash('sha256').update(script).digest('hex').slice(0, 12);
const encoded = Buffer.from(script, 'utf8').toString('base64');

await writeFile(
  TARGET,
  `export const WORKER_SCRIPT_VERSION = '${version}';\n\n` +
    `export const WORKER_SCRIPT_BASE64 =\n  '${encoded}';\n`,
  'utf8',
);

console.log(`version ${version}`);
console.log(`script  ${(script.length / 1024).toFixed(1)} KB`);
console.log(`written ${TARGET}`);
