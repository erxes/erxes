import { Module } from 'node:module';
import type { TestContext } from './helperHarness';

export const isolateViberModules = (
  t: TestContext,
  mocks: Record<string, Record<string, unknown>>,
  fresh: string[],
): void => {
  const originals = new Map<string, NodeModule | undefined>();
  t.after(() => {
    for (const [filename, original] of originals) {
      if (original) require.cache[filename] = original;
      else delete require.cache[filename];
    }
  });
  for (const specifier of [...Object.keys(mocks), ...fresh]) {
    const filename = require.resolve(specifier);
    if (!originals.has(filename))
      originals.set(filename, require.cache[filename]);
    if (mocks[specifier]) {
      const replacement = new Module(filename);
      replacement.filename = filename;
      replacement.loaded = true;
      replacement.exports = mocks[specifier];
      require.cache[filename] = replacement;
    } else delete require.cache[filename];
  }
};
