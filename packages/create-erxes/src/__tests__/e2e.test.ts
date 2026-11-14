// Generates a plugin with the packed CLI and runs its own gates, as its CI would, against
// core's packed packages instead of npm's, so a pass proves the plugin builds standalone.
// CI's packages job runs it: CREATE_ERXES_PACKS names the `pnpm pack` tarballs, and the
// plugin's tests and check:rls need DATA_TEST_URL.
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { x } from 'tinyexec';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import lint from '../../../lint/package.json' with { type: 'json' };

const packs = resolve(process.env.CREATE_ERXES_PACKS ?? '');
const repo = resolve(import.meta.dirname, '../../../..');

const run = async (command: string, args: string[], cwd: string) => {
  const result = await x(command, args, {
    nodeOptions: { cwd },
    timeout: 10 * 60_000,
    throwOnError: false,
  });

  if (result.exitCode !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}\n${result.stdout}${result.stderr}`,
    );
  }
};

const tarball = async (name: string) => {
  const file = (await readdir(packs)).find((entry) =>
    new RegExp(`^${name}-\\d.*\\.tgz$`).test(entry),
  );

  if (!file) throw new Error(`No ${name} tarball in ${packs}`);

  return join(packs, file);
};

/** Points the plugin's core packages at the tarballs; plugin-sdk's own core-contract too. */
const usePacks = async (dir: string) => {
  const contract = `file:${await tarball('erxes-core-contract')}`;

  const replacements: [string, string, string][] = [
    [
      'api/package.json',
      '"@erxes/core-contract": "v2-next"',
      `"@erxes/core-contract": "${contract}"`,
    ],
    [
      'api/package.json',
      '"@erxes/plugin-sdk": "v2-next"',
      `"@erxes/plugin-sdk": "file:${await tarball('erxes-plugin-sdk')}"`,
    ],
    [
      'ui/package.json',
      '"erxes-ui": "npm:@erxes/ui@v2-next"',
      `"erxes-ui": "file:${await tarball('erxes-ui')}"`,
    ],
    // The CLI pins the @erxes/lint it was packed with.
    [
      'package.json',
      `"@erxes/lint": "${lint.version}"`,
      `"@erxes/lint": "file:${await tarball('erxes-lint')}"`,
    ],
    [
      'pnpm-workspace.yaml',
      'overrides:\n',
      `overrides:\n  '@erxes/core-contract': '${contract}'\n`,
    ],
  ];

  for (const [file, from, to] of replacements) {
    const path = join(dir, file);
    const text = await readFile(path, 'utf8');

    if (!text.includes(from)) throw new Error(`${file} has no ${from}`);
    await writeFile(path, text.replace(from, to));
  }
};

let root: string;
let cli: string;

beforeAll(async () => {
  const scratch = join(homedir(), 'dev/scratchpad/erxes');

  await mkdir(scratch, { recursive: true });
  root = await mkdtemp(join(scratch, 'create-erxes-e2e-'));
  const prefix = join(root, 'cli');

  await run(
    'npm',
    [
      'install',
      '--prefix',
      prefix,
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      await tarball('create-erxes'),
    ],
    root,
  );
  cli = join(prefix, 'node_modules/create-erxes/dist/index.js');
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe.each([
  ['a new plugin', ['--no-migrate']],
  // No install, so the inventory doesn't run and any git checkout will do.
  ['a migrated plugin', ['--migrate', '--plugin', 'operation', '--from', repo]],
])('%s', (flow, flags) => {
  it('passes its own gates against the packed packages', { timeout: 15 * 60_000 }, async () => {
    const dir = join(root, flow.replaceAll(' ', '-'));

    await run(
      process.execPath,
      [cli, dir, '--name', 'inventory-tools', ...flags, '--no-install', '--no-git', '--yes'],
      root,
    );
    expect(existsSync(join(dir, '.claude/skills/endpoint/SKILL.md'))).toBe(true);

    // Exercise both source enumerators: a fresh scaffold and a standalone git repository.
    if (flow === 'a migrated plugin') await run('git', ['init'], dir);

    await usePacks(dir);
    await run('pnpm', ['install'], dir);

    for (const gate of [
      ['exec', 'vp', 'run', 'check'],
      ['exec', 'vp', 'run', 'test'],
      ['check:rls'],
      ['build'],
    ]) {
      await run('pnpm', gate, dir);
    }

    expect(existsSync(join(dir, 'ui/dist/remoteEntry.js'))).toBe(true);

    const source = join(dir, 'ui/src/orpc.ts');
    const original = await readFile(source, 'utf8');

    for (const directive of [
      ['oxlint', 'disable'],
      ['eslint', 'disable'],
      ['@ts', 'ignore'],
      ['@ts', 'expect-error'],
      ['@ts', 'nocheck'],
      ['oxfmt', 'ignore'],
    ]) {
      await writeFile(
        source,
        `/* ${directive.join('-')} */\n${original}\nvoid fetch('http://localhost:9');\n`,
      );
      await expect(run('pnpm', ['exec', 'vp', 'run', 'check'], dir)).rejects.toThrow(
        'check-escapes: fix the code',
      );
    }

    await writeFile(source, `${original}\nvoid fetch('http://localhost:9');\n`);
    await expect(run('pnpm', ['exec', 'vp', 'run', 'check'], dir)).rejects.toThrow(
      'no-restricted-globals',
    );
    await writeFile(
      source,
      `import { cn } from 'erxes-ui/lib/utils';\n${original}\nvoid cn('block');\n`,
    );
    await run('pnpm', ['exec', 'vp', 'run', 'check'], dir);

    await writeFile(source, `${original}\nexport const unusedProbe = 1;\n`);
    await expect(run('pnpm', ['exec', 'vp', 'run', 'check'], dir)).rejects.toThrow(
      'Unused exports',
    );
    await writeFile(source, original);

    const agents = join(dir, 'AGENTS.md');
    const docs = await readFile(agents, 'utf8');

    await writeFile(agents, `${docs}\nSee \`api/src/missing.ts\`.\n`);
    await expect(run('pnpm', ['exec', 'vp', 'run', 'check'], dir)).rejects.toThrow(
      'no file or folder api/src/missing.ts',
    );
    await writeFile(agents, docs);

    const contract = join(dir, 'api/openapi.json');
    const document = await readFile(contract, 'utf8');

    await writeFile(contract, document.replace('"v1"', '"drift"'));
    await expect(run('pnpm', ['check:generated'], dir)).rejects.toThrow('Contract drift');
    await writeFile(contract, document);

    const schema = join(dir, 'api/src/db/schema.ts');
    const tables = await readFile(schema, 'utf8');

    await writeFile(schema, tables.replace("default('')", "default('drift')"));
    await expect(run('pnpm', ['check:generated'], dir)).rejects.toThrow('Migration drift');
    await writeFile(schema, tables);
    await run('pnpm', ['exec', 'vp', 'run', 'check'], dir);
  });
});
