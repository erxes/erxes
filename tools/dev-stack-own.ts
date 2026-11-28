/**
 * `vp run dev:stack up` on a Postgres of your own (DEV_STACK_DATA_URL, its owner) instead of the
 * throwaway one: its data stays. `up` checks it answers, migrates it, grants the API's role, and
 * keeps each plugin's database password and client secret across `up`s.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';
import { z } from 'zod';
import {
  Credentials,
  type DevPlugin,
  credentialsInCheckout,
  rolePasswords,
  serverOf,
} from './dev-stack-plugins.ts';

/** Runs one of core's database scripts as the owner and returns what it printed. */
type Db = (args: string[]) => string;

/** A setting from the shell, else from the checkout's `.env`. */
export const settingIn = (root: string) => (name: string) => {
  const file = resolve(root, '.env');

  const value =
    process.env[name] ??
    (existsSync(file) ? parseEnv(readFileSync(file, 'utf8'))[name] : undefined);

  return value?.trim() || undefined;
};

/** The URL without its password, to print. */
export const shown = (url: string) => {
  const parsed = new URL(url);

  if (parsed.password) parsed.password = '***';

  return parsed.href;
};

/** Your Postgres answers on its port, else `up` stops before touching anything. */
export const reachable = (url: string) =>
  new Promise<void>((done, failed) => {
    const { hostname } = new URL(url);
    const port = Number(new URL(url).port || 5432);
    const socket = createConnection({ host: hostname, port });

    socket.setTimeout(3000);
    socket.once('connect', () => {
      socket.destroy();
      done();
    });

    const refuse = () => {
      socket.destroy();
      failed(new Error(`DEV_STACK_DATA_URL: nothing answers at ${hostname}:${port}. Is it up?`));
    };

    socket.once('timeout', refuse);
    socket.once('error', refuse);
  });

/** What a failed `execFileSync` printed. */
const Printed = z.object({ stdout: z.string().optional(), stderr: z.string().optional() });

/** Core's migrations and the API's runtime role; the data stays as it is. */
export const prepareOwn = (db: Db, dataUrl: string, runtimeRole: string) => {
  try {
    db(['db:migrate']);
    db(['db:grant', runtimeRole]);
  } catch (error) {
    const printed = Printed.safeParse(error).data;

    throw new Error(
      `Preparing ${shown(dataUrl)} failed:\n${printed?.stdout ?? ''}${printed?.stderr ?? ''}`,
      { cause: error },
    );
  }
};

const stored = (file: string): Credentials => {
  try {
    return Credentials.parse(JSON.parse(readFileSync(file, 'utf8')));
  } catch {
    return {};
  }
};

/**
 * Each plugin's password and secret: the ones `up` made before on this server, else its
 * checkout's `.env` ones, else new (its role then gets the new password). Kept in `file`;
 * delete it to have `up` make new ones.
 */
export const ownCredentials = (
  plugins: DevPlugin[],
  { db, dataUrl, file }: { db: Db; dataUrl: string; file: string },
) => {
  const known = new Map<string, { password: string; secret: string }>();

  if (!plugins.length) return known;

  const server = serverOf(dataUrl);
  const kept = stored(file);
  const key = (plugin: DevPlugin) => `${server}#${plugin.name}`;

  for (const plugin of plugins) {
    const found = kept[key(plugin)] ?? credentialsInCheckout(plugin, server);

    if (found) known.set(plugin.name, found);
  }

  const fresh = plugins.filter((plugin) => !known.has(plugin.name));

  // Grants only: the role keeps the password it has.
  if (known.size) db(['db:plugin-role', ...known.keys(), '--keep-password']);

  if (fresh.length) {
    const passwords = rolePasswords(db(['db:plugin-role', ...fresh.map((plugin) => plugin.name)]));

    for (const plugin of fresh) {
      const password = passwords.get(plugin.name);

      if (!password) throw new Error(`db:plugin-role printed no password for ${plugin.name}`);

      known.set(plugin.name, { password, secret: plugin.secret });
    }
  }

  for (const plugin of plugins) {
    const found = known.get(plugin.name);

    if (found) kept[key(plugin)] = found;
  }

  writeFileSync(file, JSON.stringify(kept, null, 2));

  return known;
};
