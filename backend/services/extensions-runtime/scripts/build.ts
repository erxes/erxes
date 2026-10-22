// Writes <extDir>/dist/<id>-<version>.erxext.json, the file an owner uploads
// in Settings > Extensions.
//
//   npx tsx scripts/build.ts <extDir>
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { packageExtension } from './package';

const [extDir] = process.argv.slice(2);

const main = async () => {
  if (!extDir) {
    throw new Error('usage: build.ts <extDir>');
  }

  const bundle = await packageExtension(extDir);
  const file = path.join(
    extDir,
    'dist',
    `${bundle.id}-${bundle.version}.erxext.json`,
  );

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(bundle));
  console.log(
    `${file} (${Math.round(JSON.stringify(bundle).length / 1024)} KB)`,
  );
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
