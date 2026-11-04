import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// The CLI runs from the monorepo: it builds against this SDK and the erxes
// sources next to it.
export const SDK_DIR = path.resolve(__dirname, '../..');
export const REPO_DIR = path.resolve(SDK_DIR, '../..');

// Every tool resolves `erxes-sdk` here, so an extension builds against this
// SDK whether or not pnpm linked it.
export const SDK_ALIAS = { 'erxes-sdk': path.join(SDK_DIR, 'src') };

export const exists = (file: string) =>
  stat(file).then(
    () => true,
    () => false,
  );

export type Package = { id: string; version: string };

// An extension's id and version are its package.json name and version.
export const readPackage = async (extDir: string): Promise<Package> => {
  const pkg: { name?: unknown; version?: unknown } = JSON.parse(
    await readFile(path.join(extDir, 'package.json'), 'utf8'),
  );

  if (typeof pkg.name !== 'string' || !/^[a-z][a-z0-9-]*$/.test(pkg.name)) {
    throw new Error(
      'package.json name must be the extension id: lowercase letters, digits and dashes, starting with a letter',
    );
  }

  if (typeof pkg.version !== 'string' || !pkg.version) {
    throw new Error('package.json needs a version');
  }

  return { id: pkg.name, version: pkg.version };
};
