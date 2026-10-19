import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import { build } from 'esbuild';

const output = resolve(dirname(fileURLToPath(import.meta.url)), '../../dist');
const manifest = JSON.parse(
  await readFile(join(output, 'package.json'), 'utf8'),
);

async function declarationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return declarationFiles(path);
      return entry.name.endsWith('.d.ts') ? [path] : [];
    }),
  );
  return nested.flat();
}

test('the published entry and subpaths resolve to JavaScript and declarations', async () => {
  assert.equal(manifest.name, '@erxes/ui');
  assert.equal(manifest.type, 'module');
  assert.equal(manifest.exports['.'].default, './index.js');
  assert.equal(manifest.exports['./lib'].default, './lib/index.js');
  assert.ok(manifest.sideEffects.includes('./index.js'));
  assert.ok(manifest.sideEffects.includes('./components/button.js'));
  assert.equal(
    manifest.exports['./components'].default,
    './components/index.js',
  );
  for (const [key, entry] of Object.entries(manifest.exports)) {
    if (key.includes('*')) continue;
    const paths = typeof entry === 'string' ? [entry] : Object.values(entry);
    await Promise.all(paths.map((path) => access(join(output, path))));
  }
  assert.match(
    await readFile(join(output, 'index.js'), 'utf8'),
    /^'use client';/,
  );
});

for (const entry of ['index.js', 'components/button.js']) {
  test(`${entry} bundles with styles without consumer aliases or Tailwind`, async () => {
    const result = await build({
      entryPoints: [join(output, entry)],
      outdir: join(output, '__consumer_test__'),
      bundle: true,
      packages: 'external',
      format: 'esm',
      write: false,
      metafile: true,
      tsconfigRaw: { compilerOptions: {} },
      logLevel: 'silent',
    });
    const css = result.outputFiles.find((file) => file.path.endsWith('.css'));
    assert.ok(css, 'Importing a component must also include its stylesheet.');
    assert.ok(
      /\.bg-primary[\s,{]/.test(css.text),
      'The primary button styles are missing.',
    );
    assert.ok(css.text.includes('--primary:'), 'The default theme is missing.');
    assert.ok(/\.dark[\s{]/.test(css.text), 'The dark theme is missing.');
    assert.ok(
      !/@(theme|utility|source|plugin)\b/.test(css.text),
      'Styles still require Tailwind processing.',
    );
    for (const artifact of Object.values(result.metafile.outputs)) {
      for (const dependency of artifact.imports) {
        assert.doesNotMatch(dependency.path, /^(erxes-ui|@erxes\/ui)(\/|$)/);
      }
    }
  });
}

test('declarations do not depend on a consumer erxes-ui alias', async () => {
  const files = await declarationFiles(output);
  assert.ok(files.length > 100);
  for (const file of files) {
    const declaration = await readFile(file, 'utf8');
    assert.doesNotMatch(declaration, /['"]erxes-ui(?:\/|['"])/, file);
  }
});

test('pure utilities remain usable without a CSS loader', async () => {
  const utilities = await import(
    pathToFileURL(join(output, 'lib/index.js')).href
  );
  assert.equal(utilities.cn('p-2', 'p-4'), 'p-4');
});
