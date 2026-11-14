import { relative, resolve } from 'node:path';
import * as p from '@clack/prompts';
import { Command } from 'commander';
import { x } from 'tinyexec';
import pkg from '../package.json' with { type: 'json' };
import {
  askCheckout,
  askMigrate,
  askName,
  askOldPlugin,
  askText,
  askYes,
  CliOptions,
  fail,
  isEmptyDir,
} from './ask';
import { cloneErxes, DEFAULT_REF, erxesCacheDir, type OldPlugin } from './existing-plugins';
import { derivePluginNames, type PluginNames, validateLine } from './naming';
import { scaffold } from './scaffold';

const API_PORT = 3399;
const UI_PORT = 3099;

type Migration = { plugin: OldPlugin; from: string | undefined; ref: string };

type Plan = {
  targetDir: string;
  names: PluginNames;
  description: string;
  migration: Migration | undefined;
  install: boolean;
  git: boolean;
  pnpmVersion: string;
};

const run = async (command: string, args: string[], cwd: string) => {
  const result = await x(command, args, { nodeOptions: { cwd }, throwOnError: false });

  return { ok: result.exitCode === 0, output: `${result.stdout}${result.stderr}`.trim() };
};

// Next steps target a POSIX shell on Unix and PowerShell on Windows. Single
// quotes keep spaces and shell metacharacters literal in both, with different
// escaping for an apostrophe inside the path.
const changeDirectoryCommand = (path: string) =>
  process.platform === 'win32'
    ? `Set-Location -LiteralPath '${path.replaceAll("'", "''")}'`
    : `cd -- '${path.replaceAll("'", "'\\''")}'`;

const pnpmVersion = async () => {
  const version = (await x('pnpm', ['--version'], { throwOnError: false })).stdout.trim();

  return /^\d+\.\d+\.\d+$/.test(version)
    ? version
    : fail('erxes plugins use pnpm. Install it with `corepack enable pnpm` and run again.');
};

/** Every question, before anything is written. */
const ask = async (directory: string | undefined, cli: CliOptions): Promise<Plan> => {
  const migrate = await askMigrate(cli);
  const plugin = migrate ? await askOldPlugin(cli) : undefined;
  const migration = plugin && { plugin, from: await askCheckout(cli), ref: cli.ref ?? DEFAULT_REF };
  const name = await askName(cli, directory, plugin);
  const targetDir = resolve(directory ?? name);

  if (!isEmptyDir(targetDir)) fail(`${targetDir} already exists and is not empty.`);

  const fallback = derivePluginNames(name);
  const title = await askText('Title', cli.title, fallback.title, validateLine(80), cli.yes);

  const description = await askText(
    'Description',
    cli.description,
    `${title} plugin for erxes`,
    validateLine(500),
    cli.yes,
  );

  const install = cli.install && (await askYes('Install dependencies now?', cli.yes));
  const git = cli.git && (await askYes('Initialize a git repository?', cli.yes));

  return {
    targetDir,
    names: derivePluginNames(name, title),
    description,
    migration,
    install,
    git,
    pnpmVersion: await pnpmVersion(),
  };
};

/** Runs a step under the spinner; a failure prints its output. */
const step = async (
  label: string,
  done: string,
  work: () => Promise<{ ok: boolean; output: string }>,
) => {
  const spin = p.spinner();

  spin.start(label);
  const result = await work();

  if (result.ok) spin.stop(done);
  else {
    spin.error(`${label} failed`);
    p.log.message(result.output);
  }

  return result;
};

const clone = async () => {
  try {
    return { ok: true, output: await cloneErxes() };
  } catch (error) {
    return { ok: false, output: error instanceof Error ? error.message : String(error) };
  }
};

const create = async (plan: Plan) => {
  const { targetDir, names, migration } = plan;

  await scaffold(targetDir, {
    names,
    description: plan.description,
    apiPort: API_PORT,
    uiPort: UI_PORT,
    pnpmVersion: plan.pnpmVersion,
    migrateFrom: migration?.plugin,
  });
  p.log.success(`Created ${relative(process.cwd(), targetDir) || '.'}`);

  if (plan.git) {
    const git = await run('git', ['init', '-q'], targetDir);

    if (!git.ok) p.log.warn(`git init failed: ${git.output}`);
  }

  const cloned =
    migration && !migration.from
      ? await step('Cloning erxes/erxes', `Old erxes is in ${erxesCacheDir()}`, clone)
      : undefined;

  const from = migration?.from ?? (cloned?.ok ? cloned.output : undefined);

  const installed =
    plan.install &&
    (
      await step('Installing dependencies with pnpm', 'Dependencies installed', () =>
        run('pnpm', ['install'], targetDir),
      )
    ).ok;

  const inventoryArgs =
    migration && from ? ['--from', from, '--plugin', migration.plugin, '--ref', migration.ref] : [];

  const inventoried =
    installed &&
    inventoryArgs.length > 0 &&
    (
      await step(
        `Reading ${migration?.plugin} at ${migration?.ref}`,
        'Wrote MIGRATION.md',
        async () => {
          const inventory = await run(
            'pnpm',
            ['-s', 'migrate:inventory', '--', ...inventoryArgs],
            targetDir,
          );

          return inventory.ok ? run('pnpm', ['-s', 'migrate:checklist'], targetDir) : inventory;
        },
      )
    ).ok;

  // Names of different lengths shift Markdown tables and sorted keys.
  if (installed) await run('pnpm', ['exec', 'vp', 'fmt'], targetDir);

  return { installed, inventoried, inventoryArgs };
};

const nextSteps = (plan: Plan, result: Awaited<ReturnType<typeof create>>) => {
  const cd = relative(process.cwd(), plan.targetDir);

  return [
    ...(cd ? [changeDirectoryCommand(cd)] : []),
    ...(result.installed ? [] : ['pnpm install']),
    ...(plan.migration && !result.inventoried
      ? [`pnpm migrate:inventory -- ${result.inventoryArgs.join(' ')}`, 'pnpm migrate:checklist']
      : []),
    'cp .env.example .env',
    'pnpm dev:api',
    'pnpm dev:ui',
    '',
    `core .env: CORE_PLUGIN_KEYS=${plan.names.id}:<32+ character secret>`,
    `core-ui .env: PUBLIC_PLUGINS=${plan.names.remote}@http://localhost:${UI_PORT}/remoteEntry.js`,
    ...(plan.migration
      ? ['', 'Then work through MIGRATION.md with the plugin-migrate skill.']
      : []),
  ].join('\n');
};

const main = async (directory: string | undefined, options: unknown) => {
  p.intro('create-erxes');

  const plan = await ask(directory, CliOptions.parse(options));
  const result = await create(plan);

  const ready =
    (!plan.install || result.installed) && (!plan.migration || !plan.install || result.inventoried);

  p.note(nextSteps(plan, result), 'Next steps');

  if (!ready) {
    p.log.error('A step failed; see its output above.');
    p.outro(`Plugin "${plan.names.name}" was created, but it is not ready yet.`);
    process.exitCode = 1;

    return;
  }

  p.outro(`Plugin "${plan.names.name}" is ready. See AGENTS.md.`);
};

export const runCli = async (argv: string[]) => {
  const program = new Command('create-erxes')
    .version(pkg.version)
    .description('Create an erxes plugin for the new core, or migrate an old erxes plugin onto it')
    .argument('[directory]', 'target directory (defaults to the plugin name)')
    .option('--migrate', 'migrate an old erxes plugin')
    .option('--no-migrate', 'start a new plugin')
    .option('--plugin <name>', 'migrate: the old plugin, e.g. operation')
    .option('--from <path>', 'migrate: read this old erxes checkout')
    .option('--clone', 'migrate: clone erxes/erxes main to read the old plugin')
    .option('--ref <ref>', `migrate: the git ref to read (default ${DEFAULT_REF})`)
    .option('-n, --name <name>', 'plugin name, e.g. inventory or erxes-agent-v2')
    .option('-t, --title <title>', 'title shown in erxes navigation')
    .option('-d, --description <text>', 'one-line description')
    .option('--no-install', 'skip installing dependencies')
    .option('--no-git', 'skip git init')
    .option('-y, --yes', 'accept defaults for every unanswered question')
    .action(main);

  await program.parseAsync(argv);
};
