import { existsSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import * as p from '@clack/prompts';
import { z } from 'zod';
import { erxesCacheDir, isOldPlugin, OLD_PLUGINS, type OldPlugin } from './existing-plugins';
import { validatePluginName } from './naming';

export const CliOptions = z.object({
  migrate: z.boolean().optional(),
  plugin: z.string().optional(),
  from: z.string().optional(),
  clone: z.boolean().optional(),
  ref: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  install: z.boolean(),
  git: z.boolean(),
  yes: z.boolean().optional(),
});

export type CliOptions = z.infer<typeof CliOptions>;

export const fail = (message: string): never => {
  p.cancel(message);
  process.exit(1);
};

const isAnswer = <T>(value: T): value is Exclude<T, symbol> => typeof value !== 'symbol';

/** A prompt's answer, or the end of the run when the user cancels it (clack returns a symbol). */
const answer = <T>(value: T) => (isAnswer(value) ? value : fail('Cancelled.'));

const isCheckout = (dir: string) => existsSync(join(dir, '.git'));

export const isEmptyDir = (dir: string) => !existsSync(dir) || readdirSync(dir).length === 0;

export const askMigrate = async (cli: CliOptions) => {
  if (cli.migrate !== undefined) return cli.migrate;

  if (cli.plugin || cli.from || cli.clone) return true;

  if (cli.yes) return false;

  return answer(
    await p.select({
      message: 'What are you making?',
      options: [
        { value: false, label: 'New plugin' },
        {
          value: true,
          label: 'Migrate an old plugin',
          hint: 'an erxes 3.x plugin, onto the new core',
        },
      ],
    }),
  );
};

export const askOldPlugin = async (cli: CliOptions): Promise<OldPlugin> => {
  if (cli.plugin) {
    return isOldPlugin(cli.plugin)
      ? cli.plugin
      : fail(`No old plugin "${cli.plugin}". Old plugins: ${OLD_PLUGINS.join(', ')}`);
  }

  if (cli.yes) return fail('Pass the old plugin to migrate with --plugin.');

  return answer(
    await p.select({
      message: 'Old plugin to migrate',
      options: OLD_PLUGINS.map((value) => ({ value, label: value })),
    }),
  );
};

/** The old erxes checkout to read, or undefined to clone one. */
export const askCheckout = async (cli: CliOptions) => {
  if (cli.from && cli.clone) return fail('Pass --from or --clone, not both.');

  if (cli.from) {
    const dir = resolve(cli.from);

    return isCheckout(dir) ? dir : fail(`${dir} is not a git checkout.`);
  }

  if (cli.clone) return undefined;

  if (cli.yes) return fail('Pass an old erxes checkout with --from, or --clone.');

  const where = answer(
    await p.select({
      message: 'Old erxes checkout',
      options: [
        { value: 'path', label: 'A checkout on this machine' },
        {
          value: 'clone',
          label: `Clone erxes/erxes main into ${erxesCacheDir()}`,
          hint: 'blobless, only backend/plugins and frontend/plugins',
        },
      ],
    }),
  );

  if (where === 'clone') return undefined;

  const path = answer(
    await p.text({
      message: 'Path to the old erxes checkout',
      validate: (value) => (isCheckout(resolve(value ?? '')) ? undefined : 'Not a git checkout.'),
    }),
  );

  return resolve(path);
};

/** The plugin name: --name, else the directory's name, else asked (an old plugin's name first). */
export const askName = async (cli: CliOptions, directory?: string, oldPlugin?: OldPlugin) => {
  const fromDirectory = directory ? basename(resolve(directory)) : undefined;
  const candidate = cli.name ?? fromDirectory ?? (cli.yes ? oldPlugin : undefined);

  if (candidate !== undefined && !validatePluginName(candidate)) return candidate;

  if (cli.name) return fail(`Invalid plugin name "${cli.name}": ${validatePluginName(cli.name)}`);

  if (cli.yes) return fail('Pass a valid plugin name with --name or as the directory.');

  return answer(
    await p.text({
      message: 'Plugin name',
      placeholder: 'inventory',
      initialValue: oldPlugin,
      validate: (value) => validatePluginName(value ?? ''),
    }),
  );
};

export const askText = async (
  message: string,
  given: string | undefined,
  fallback: string,
  validate: (text: string) => string | undefined,
  yes?: boolean,
) => {
  if (given !== undefined) {
    const error = validate(given);

    return error ? fail(`${message}: ${error}`) : given;
  }

  if (yes) return fallback;

  return answer(
    await p.text({
      message,
      defaultValue: fallback,
      placeholder: fallback,
      validate: (value) => validate(value ?? ''),
    }),
  );
};

export const askYes = async (message: string, yes = false) =>
  yes || answer(await p.confirm({ message, initialValue: true }));
