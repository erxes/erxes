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
import root from '../../../package.json' with { type: 'json' };

const pkg = resolve(import.meta.dirname, '..');
const repo = resolve(pkg, '../..');
const out = join(pkg, 'dist/templates');

/** Core files every plugin gets unchanged, at the same path. */
const CORE_FILES = ['tools/check-rls.sql', 'tools/test/no-skips.ts'];

/** The section every erxes repo's AGENTS.md has, unchanged. */
const QUALITY = /<!-- quality:start -->[\s\S]*?<!-- quality:end -->/;

/** The version tokens in the template's package.json files; React Doctor's is core's pin. */
const VERSIONS = {
  __contractVersion__: contract.version,
  __lintVersion__: lint.version,
  __sdkVersion__: sdk.version,
  __uiVersion__: ui.version,
  __reactDoctorVersion__: root.devDependencies['react-doctor'],
};

/** Core's React Doctor config, which a plugin runs on its one React project, ui/. */
const DOCTOR_CONFIG = 'doctor.config.jsonc';
const DOCTOR_PROJECTS = /"projects": \[[^\]]*\]/;

// Core's own exceptions, by file, with the comment lines above them.
const DOCTOR_IGNORE = /\n(?: {2}\/\/[^\n]*\n)* {2}"ignore": \{[\s\S]*?\n {2}\},?(?=\n)/;

/** Core's tenant functions plugin migrations call; the last migration to define one wins. */
const TENANT_FUNCTIONS = ['core_tenant_visible', 'core_enable_tenant_rls'];

/** Core's functions a plugin's code calls in its own transactions. */
const PLUGIN_FUNCTIONS = ['core_publish_event', 'core_record_audit', 'core_live_signal'];

/** The core tables those functions write, which a plugin's tests read back. */
const CORE_TABLES = ['core_events', 'core_audit_logs'];

/**
 * A test database has no core plugin registry, so `core_enter_org()` keeps core's
 * organisation check and skips its check that the plugin is installed.
 */
const ENTER_ORG = `CREATE OR REPLACE FUNCTION core_enter_org(p_org_id text, p_plugin text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  v_current text := nullif(current_setting('app.org_id', true), '');
BEGIN
  IF v_current IS NULL THEN
    PERFORM set_config('app.org_id', p_org_id, true);
  ELSIF v_current <> p_org_id THEN
    RAISE EXCEPTION 'this transaction works for organisation %, not %', v_current, p_org_id;
  END IF;
END $$;`;

const qualitySection = async () => {
  const section = QUALITY.exec(await readFile(join(repo, 'AGENTS.md'), 'utf8'))?.[0];

  if (!section) throw new Error('AGENTS.md has no quality section');

  return section;
};

const doctorConfig = async () => {
  const config = await readFile(join(repo, DOCTOR_CONFIG), 'utf8');

  if (!DOCTOR_PROJECTS.test(config)) throw new Error(`${DOCTOR_CONFIG} has no projects list`);

  return config.replace(DOCTOR_PROJECTS, '"projects": ["ui"]').replace(DOCTOR_IGNORE, '');
};

const MIGRATIONS = join(repo, 'packages/db/drizzle');

/** Core's migrations, oldest first. */
const migrations = async () => {
  const files = (await readdir(MIGRATIONS)).filter((file) => file.endsWith('.sql')).toSorted();

  return Promise.all(files.map((file) => readFile(join(MIGRATIONS, file), 'utf8')));
};

const coreFunctions = (sources: string[], names: string[]) =>
  names.map((name) => {
    const pattern = new RegExp(`CREATE OR REPLACE FUNCTION ${name}\\([\\s\\S]*?\\$\\$;`, 'g');
    const definition = sources.flatMap((source) => source.match(pattern) ?? []).at(-1);

    if (!definition) throw new Error(`No migration in ${MIGRATIONS} defines ${name}`);

    return definition;
  });

/** The extensions core's migrations create, which a plugin's tables may use but not create. */
const coreExtensions = (sources: string[]) => [
  ...new Set(
    sources.flatMap((source) => source.match(/CREATE EXTENSION IF NOT EXISTS \w+;/g) ?? []),
  ),
];

/**
 * A core table as its migrations build it, in order: the table, its column changes and its
 * indexes, without the foreign keys to core's other tables. Row level security as in core.
 */
const coreTable = (sources: string[], table: string) => {
  const pattern = new RegExp(
    [
      `CREATE TABLE "${table}" \\([\\s\\S]*?\\n\\);`,
      `ALTER TABLE "${table}" (?:ADD|DROP|ALTER) COLUMN [^;]*;`,
      `CREATE (?:UNIQUE )?INDEX "[^"]+" ON "${table}" [^;]*;`,
    ].join('|'),
    'g',
  );

  const statements = sources.flatMap((source) => source.match(pattern) ?? []);

  if (!statements[0]?.startsWith('CREATE TABLE'))
    throw new Error(`No migration in ${MIGRATIONS} creates ${table}`);

  return [
    ...statements,
    `SELECT core_enable_tenant_rls('${table}');`,
    `GRANT SELECT, INSERT ON ${table} TO PUBLIC;`,
  ].join('\n');
};

/** What a plugin's throwaway databases get from core, by file in `api/src/test/`. */
const testSql = async () => {
  const sources = await migrations();

  return {
    'core-functions.sql': [
      "-- Core's extensions and tenant functions, which plugin migrations use, as erxes",
      '-- packages/db/drizzle creates them. Tests and tools/check-rls.sh install them',
      '-- in their throwaway databases.',
      ...coreExtensions(sources),
      ...coreFunctions(sources, TENANT_FUNCTIONS),
    ],
    'core-calls.sql': [
      "-- Core's functions a plugin calls in its own transactions (core_publish_event,",
      '-- core_record_audit, core_live_signal), as erxes packages/db/drizzle defines',
      '-- them, and the core tables they write. Tests install them, so a procedure that',
      '-- publishes runs, and a test reads its events back from core_events.',
      ...coreFunctions(sources, PLUGIN_FUNCTIONS),
      ENTER_ORG,
      ...CORE_TABLES.map((table) => coreTable(sources, table)),
    ],
  };
};

export const writeTemplates = async () => {
  await rm(out, { recursive: true, force: true });
  await cp(join(pkg, 'templates'), out, { recursive: true });

  for (const file of CORE_FILES) await cp(join(repo, file), join(out, 'base', file));

  await writeFile(join(out, 'base', DOCTOR_CONFIG), await doctorConfig());

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

  for (const [file, lines] of Object.entries(await testSql()))
    await writeFile(join(out, 'base/api/src/test', file), [...lines, ''].join('\n'));
};
