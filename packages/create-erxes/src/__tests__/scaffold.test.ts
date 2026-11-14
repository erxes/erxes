import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, readlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { z } from 'zod';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { writeTemplates } from '../../scripts/templates.ts';
import { derivePluginNames } from '../naming';
import { scaffold, type ScaffoldOptions } from '../scaffold';

const repo = resolve(import.meta.dirname, '../../../..');

const options: ScaffoldOptions = {
  names: derivePluginNames('erxes-agent-v2', "Agent's desk"),
  description: 'Test plugin',
  apiPort: 3400,
  uiPort: 3100,
  pnpmVersion: '11.5.2',
};

// Template tokens only; `__tests__` folders are real names.
const TOKEN = /__(id|Pascal|title|description|apiPort|uiPort|pnpmVersion|migrationSkill)__/;

const PackageJson = z.object({
  name: z.string(),
  packageManager: z.string().optional(),
  scripts: z.record(z.string(), z.string()),
  devDependencies: z.record(z.string(), z.string()),
});

const listFiles = async (dir: string) =>
  (await readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));

const read = (dir: string, file: string) => readFile(join(dir, file), 'utf8');

/** Files that still hold a template token. */
const withTokens = async (dir: string) => {
  const files = await listFiles(dir);
  const texts = await Promise.all(files.map((file) => readFile(file, 'utf8')));

  return files.filter((_, index) => TOKEN.test(texts[index] ?? ''));
};

const missing = (dir: string, files: string[]) =>
  files.filter((file) => !existsSync(join(dir, file)));

const readPackageJson = async (dir: string) =>
  PackageJson.parse(JSON.parse(await read(dir, 'package.json')));

let root: string;

beforeAll(async () => {
  await writeTemplates();
  root = await mkdtemp(join(tmpdir(), 'create-erxes-'));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('scaffold', () => {
  it('writes a new plugin with one identity and no migration kit', async () => {
    const dir = join(root, 'new');

    await scaffold(dir, options);

    expect(await withTokens(dir)).toEqual([]);
    expect(missing(dir, ['.gitignore', '.dockerignore', '.env.example', '.node-version'])).toEqual(
      [],
    );
    expect(await readlink(join(dir, '.claude/skills'))).toBe(join('..', '.agents', 'skills'));
    expect(existsSync(join(dir, '.claude/skills/endpoint/SKILL.md'))).toBe(true);
    expect(existsSync(join(dir, 'migration'))).toBe(false);
    expect(existsSync(join(dir, '.agents/skills/plugin-migrate'))).toBe(false);

    const pkg = await readPackageJson(dir);

    expect(pkg.packageManager).toBe('pnpm@11.5.2');
    expect(pkg.scripts['migrate:inventory']).toBeUndefined();

    const core = await read(dir, 'api/src/core.ts');

    expect(core).toMatch(/remote: 'erxes_agent_v2_ui'/);
    expect(core).toContain("title: 'Agent\\'s desk'");
    expect(await read(dir, 'api/src/config.ts')).toMatch(/PLUGIN = 'erxes_agent_v2'/);
    expect(await read(dir, 'api/drizzle/0000_items.sql')).toMatch(
      /core_enable_tenant_rls\('erxes_agent_v2_items'\)/,
    );
    expect(await read(dir, 'ui/rsbuild.config.ts')).toContain(
      "'./erxes_agent_v2': './src/ErxesAgentV2.tsx'",
    );
    expect(existsSync(join(dir, 'ui/src/ErxesAgentV2.tsx'))).toBe(true);
    expect(await read(dir, '.env.example')).toMatch(/PORT=3400/);
    expect(await read(dir, 'AGENTS.md')).toMatch(/^# Agent's desk\n\nTest plugin\n/);
  });

  it("takes core's shared files and quality section unchanged", async () => {
    const dir = join(root, 'new');
    const quality = /<!-- quality:start -->[\s\S]*<!-- quality:end -->/;

    const shared = ['tools/check-rls.sql', 'tools/test/no-skips.ts'];

    const changed: string[] = [];

    for (const file of shared) {
      if ((await read(dir, file)) !== (await read(repo, file))) changed.push(file);
    }

    expect(changed).toEqual([]);
    expect(quality.exec(await read(dir, 'AGENTS.md'))?.[0]).toBe(
      quality.exec(await read(repo, 'AGENTS.md'))?.[0],
    );
    expect(await read(dir, 'api/src/test/core-functions.sql')).toMatch(
      /FUNCTION core_tenant_visible[\s\S]*FUNCTION core_enable_tenant_rls/,
    );
  });

  it('adds the migration kit for a port', async () => {
    const dir = join(root, 'migrate');

    await scaffold(dir, { ...options, migrateFrom: 'operation' });

    expect(await withTokens(dir)).toEqual([]);
    expect(
      missing(dir, [
        'migration/inventory.ts',
        'migration/checklist.ts',
        'migration/core-map.ts',
        'migration/import-map.ts',
        'scripts/import-mongo.ts',
        '.agents/skills/plugin-migrate/SKILL.md',
      ]),
    ).toEqual([]);

    const pkg = await readPackageJson(dir);

    expect(pkg.name).toBe('@erxes_agent_v2/plugin');
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts['migrate:inventory']).toBe('node migration/inventory.ts');
    expect(pkg.devDependencies['@ast-grep/napi']).toBeDefined();
    expect(pkg.devDependencies['vite-plus']).toBeDefined();
    expect(await read(dir, 'AGENTS.md')).toMatch(/old erxes `operation` plugin/);
  });
});
