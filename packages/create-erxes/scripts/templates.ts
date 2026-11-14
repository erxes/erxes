/**
 * Writes dist/templates, what the CLI copies into a new plugin: templates/ as it is,
 * plus what a plugin takes from core, read from this repo so nothing is a hand-kept
 * copy. tsdown runs it after each build; the scaffold test runs it first.
 */
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import contract from '../../contract/package.json' with { type: 'json' };
import lint from '../../lint/package.json' with { type: 'json' };
import sdk from '../../plugin-sdk/package.json' with { type: 'json' };
import ui from '../../ui/package.json' with { type: 'json' };

const pkg = resolve(import.meta.dirname, '..');
const repo = resolve(pkg, '../..');
const out = join(pkg, 'dist/templates');

/** Core files every plugin gets unchanged, at the same path. */
const CORE_FILES = ['tools/check-rls.sql', 'tools/test/no-skips.ts'];

/** The section every erxes repo's AGENTS.md has, unchanged. */
const QUALITY = /<!-- quality:start -->[\s\S]*?<!-- quality:end -->/;

/** The version tokens in the template's package.json files. */
const VERSIONS = {
  __contractVersion__: contract.version,
  __lintVersion__: lint.version,
  __sdkVersion__: sdk.version,
  __uiVersion__: ui.version,
};

/** Core's tenant functions plugin migrations call; the last migration to define one wins. */
const TENANT_FUNCTIONS = ['core_tenant_visible', 'core_enable_tenant_rls'];

const qualitySection = async () => {
  const section = QUALITY.exec(await readFile(join(repo, 'AGENTS.md'), 'utf8'))?.[0];

  if (!section) throw new Error('AGENTS.md has no quality section');

  return section;
};

const tenantFunctions = async () => {
  const dir = join(repo, 'packages/db/drizzle');
  const files = (await readdir(dir)).filter((file) => file.endsWith('.sql')).toSorted();
  const sources = await Promise.all(files.map((file) => readFile(join(dir, file), 'utf8')));

  return TENANT_FUNCTIONS.map((name) => {
    const pattern = new RegExp(`CREATE OR REPLACE FUNCTION ${name}\\([\\s\\S]*?\\$\\$;`, 'g');
    const definition = sources.flatMap((source) => source.match(pattern) ?? []).at(-1);

    if (!definition) throw new Error(`No migration in ${dir} defines ${name}`);

    return definition;
  });
};

export const writeTemplates = async () => {
  await rm(out, { recursive: true, force: true });
  await cp(join(pkg, 'templates'), out, { recursive: true });

  for (const file of CORE_FILES) await cp(join(repo, file), join(out, 'base', file));

  const agents = join(out, 'base/AGENTS.md');
  const quality = await qualitySection();

  await writeFile(agents, (await readFile(agents, 'utf8')).replace(QUALITY, quality));

  // A plugin depends on the core packages this CLI was packed alongside.
  for (const manifest of ['package.json', 'api/package.json', 'ui/package.json']) {
    const path = join(out, 'base', manifest);

    const text = Object.entries(VERSIONS).reduce(
      (filled, [token, version]) => filled.replaceAll(token, version),
      await readFile(path, 'utf8'),
    );

    await writeFile(path, text);
  }

  await writeFile(
    join(out, 'base/api/src/test/core-functions.sql'),
    [
      "-- Core's tenant functions, which plugin migrations call, as erxes",
      '-- packages/db/drizzle defines them. Tests and tools/check-rls.sh install them',
      '-- in their throwaway databases.',
      ...(await tenantFunctions()),
      '',
    ].join('\n'),
  );
};
