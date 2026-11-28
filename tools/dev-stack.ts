/**
 * A throwaway stack for this checkout: Postgres 18 in Docker on tmpfs, migrated, with the
 * e2e owner's organisation and its example data, and the API and UI dev servers.
 *   vp run dev:stack up [plugin dir...] | down | status
 * Each plugin dir is a plugin checkout (`pnpm create erxes`): `up` gives it a database role and a
 * secret, starts its API and UI dev servers, and installs it in the e2e organisation.
 * The container name and the ports come from the checkout's path, so parallel checkouts
 * never collide. `up` writes `.env.local`, which `vp run test` and the dev servers read.
 *
 * Core's `.env` (or the shell) may set:
 *   DEV_STACK_PLUGINS=../accounting-plugin,../sales-plugin   plugin dirs when `up` names none
 *   DEV_STACK_DATA_URL=postgres://erxes:…@127.0.0.1:5434/erxes
 * With DEV_STACK_DATA_URL, a Postgres of your own (as its owner) instead of the throwaway one: its
 * data stays, `up` migrates it and starts the servers on it, nothing is seeded, the plugins
 * install themselves in its organisations, and `down` leaves it running. Each plugin keeps its
 * database password and secret across `up`s (its checkout's `.env` ones when they point there).
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { OWNER } from '../e2e/owner.ts';
import { ownCredentials, prepareOwn, reachable, settingIn, shown } from './dev-stack-own.ts';
import {
  type DevPlugin,
  DevPlugins,
  type DevServer,
  coreEnv,
  installPlugins,
  pluginServers,
  readPlugins,
  rolePasswords,
} from './dev-stack-plugins.ts';
import { alive, answers, serversIn } from './dev-stack-helper.ts';

const root = resolve(import.meta.dirname, '..');
const id = createHash('sha256').update(root).digest('hex').slice(0, 8);
const slot = Number.parseInt(id, 16) % 1000;
const base = 20_000 + slot * 10;

/** What `up` starts for this checkout. `vp run doctor` checks the ports are free. */
export const stack = {
  container: `erxes-dev-${id}`,
  ports: { postgres: base, api: base + 1, ui: base + 2 },
};

/** Plugins get two ports each from here: 20 per checkout, in a range core's own never reach. */
const firstPluginPort = 40_000 + slot * 20;

/** Your own Postgres (its owner), when set; otherwise `up` starts the throwaway one. */
const setting = settingIn(root);
const ownPostgres = setting('DEV_STACK_DATA_URL');

// No password: the throwaway server listens on 127.0.0.1 only and trusts local connections.
const throwaway = `postgres://erxes@127.0.0.1:${stack.ports.postgres}`;
const throwawayUrl = `${throwaway}/erxes`;
const dataUrl = ownPostgres ?? throwawayUrl;
const api = `http://localhost:${stack.ports.api}`;
const ui = `http://localhost:${stack.ports.ui}`;
const state = resolve(root, '.scratch/dev-stack');
const envFile = resolve(root, '.env.local');
const pluginsFile = resolve(state, 'plugins.json');
const startedOnFile = resolve(state, 'postgres');
const credentialsFile = resolve(state, 'credentials.json');

/**
 * The API acts as this role, under row level security like production's runtime role, so
 * a query that is slow or refused there is slow or refused here. It migrates as `erxes`.
 */
const RUNTIME_ROLE = 'erxes_dev_runtime';

/** Core's dev servers, told about the plugins. */
const coreServers = (plugins: DevPlugin[]): Record<string, DevServer> => ({
  api: {
    cwd: root,
    args: ['--filter', '@erxes/api', 'dev'],
    env: {
      PORT: String(stack.ports.api),
      DATA_URL: dataUrl,
      DATA_MIGRATION_URL: dataUrl,
      DATA_ROLE: RUNTIME_ROLE,
      DATA_RUNTIME_ROLE: RUNTIME_ROLE,
      APP_URL: ui,
      // On your own Postgres nothing installs the plugins but this.
      ...(ownPostgres ? { PLUGINS_AUTO_INSTALL: 'true' } : {}),
      ...coreEnv(plugins),
    },
    ready: `${api}/ready`,
  },
  ui: {
    cwd: root,
    args: ['--filter', '@erxes/web', 'dev'],
    env: { WEB_PORT: String(stack.ports.ui), CORE_API_URL: api, ...coreEnv(plugins) },
    ready: ui,
  },
});

const say = (line: string) => process.stdout.write(`${line}\n`);

const run = (command: string, args: string[], env: NodeJS.ProcessEnv = {}) =>
  execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

/** For core's database scripts: the owner, whatever core's `.env` says. */
const ownerEnv = { NODE_ENV: 'development', DATA_URL: dataUrl, DATA_MIGRATION_URL: dataUrl };

/** A core database script, as the owner. */
const db = (args: string[]) => run('pnpm', ['--silent', ...args], ownerEnv);

const { pidOf, startAll, stop } = serversIn(state);

/** The plugins the running stack was started with. */
const startedPlugins = () => {
  try {
    return DevPlugins.parse(JSON.parse(readFileSync(pluginsFile, 'utf8')));
  } catch {
    return [];
  }
};

const containerStatus = () => {
  try {
    return run('docker', ['inspect', '-f', '{{.State.Status}}', stack.container]).trim();
  } catch {
    return 'absent';
  }
};

const startPostgres = async () => {
  run('docker', ['rm', '-f', stack.container]);
  run(
    'docker',
    [
      ['run', '-d', '--name', stack.container, '--label', `erxes.dev-stack=${root}`],
      ['-p', `127.0.0.1:${stack.ports.postgres}:5432`, '--shm-size=512m'],
      ['--tmpfs', '/var/lib/postgresql', '-e', 'POSTGRES_USER=erxes'],
      ['-e', 'POSTGRES_HOST_AUTH_METHOD=trust', '-e', 'POSTGRES_DB=erxes', 'postgres:18'],
    ].flat(),
  );

  // During init the image runs a server on the socket only; TCP answers once it is final.
  const ready = ['exec', stack.container, 'pg_isready', '-h', '127.0.0.1', '-U', 'erxes'];

  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      run('docker', ready);

      return;
    } catch {
      await sleep(500);
    }
  }

  throw new Error(`Postgres in ${stack.container} did not start`);
};

/** The organisation and owner (migrating first) and the API's role; example data comes after. */
const seed = () => {
  const printed = run(
    'pnpm',
    [
      ['--silent', 'bootstrap', '--subdomain', 'e2e', '--name', OWNER.organizationName],
      ['--email', OWNER.email, '--password', OWNER.password],
      ['--full-name', `${OWNER.firstName} ${OWNER.lastName}`],
    ].flat(),
    ownerEnv,
  );

  const token = /^token\s+(\S+)/m.exec(printed)?.[1];

  if (!token) throw new Error(`bootstrap printed no token:\n${printed}`);

  db(['db:grant', RUNTIME_ROLE]);

  return token;
};

/** A plugin's role on the stack's Postgres, same server and database. */
const pluginDataUrl = (role: string, password: string) => {
  const url = new URL(dataUrl);

  url.username = role;
  url.password = encodeURIComponent(password);

  return url.href;
};

/**
 * Each plugin's API and UI servers: with the given passwords (your own Postgres's kept ones),
 * else a fresh password for its database role.
 */
const pluginServersOf = (plugins: DevPlugin[], given?: Map<string, string>) => {
  if (!plugins.length) return {};

  const passwords =
    given ?? rolePasswords(db(['db:plugin-role', ...plugins.map((plugin) => plugin.name)]));

  const core = { dataUrl: pluginDataUrl, api, ui };

  return Object.fromEntries(
    plugins.flatMap((plugin) => {
      const password = passwords.get(plugin.name);

      if (!password) throw new Error(`db:plugin-role printed no password for ${plugin.name}`);

      return Object.entries(pluginServers(plugin, core, password));
    }),
  );
};

const loadExampleData = async (token: string) => {
  const response = await fetch(`${api}/core/v1/auth/onboarded`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ exampleData: true, language: 'en' }),
  });

  if (!response.ok) throw new Error(`example data: ${response.status} ${await response.text()}`);
};

const serverNames = () => [
  'api',
  'ui',
  ...startedPlugins().flatMap((plugin) => [`${plugin.name}-api`, `${plugin.name}-ui`]),
];

/** Stops only what `up` started here: its process groups and its container. */
const teardown = async () => {
  await Promise.all(serverNames().map(stop));
  run('docker', ['rm', '-f', stack.container]);
  rmSync(envFile, { force: true });
  rmSync(pluginsFile, { force: true });
  rmSync(startedOnFile, { force: true });
};

/** The Postgres the running stack was started on. */
const startedOn = () => {
  try {
    return readFileSync(startedOnFile, 'utf8');
  } catch {
    return undefined;
  }
};

const onThrowaway = () => (startedOn() ?? throwawayUrl) === throwawayUrl;

export const isUp = () =>
  (!onThrowaway() || containerStatus() === 'running') && alive(pidOf('api')) && alive(pidOf('ui'));

const status = async () => {
  const on = startedOn() ?? dataUrl;

  say(
    on === throwawayUrl
      ? `postgres  ${on}  ${stack.container}: ${containerStatus()}`
      : `postgres  ${shown(on)}  (your own; down leaves it running)`,
  );

  const plugins = startedPlugins();

  const servers = {
    ...coreServers(plugins),
    ...Object.fromEntries(
      plugins.flatMap((plugin) =>
        Object.entries(pluginServers(plugin, { dataUrl: () => '', api, ui }, '')),
      ),
    ),
  };

  for (const [name, server] of Object.entries(servers)) {
    const health = (await answers(server.ready)) ? 'answers' : 'not answering';

    say(`${name.padEnd(8)}  ${server.ready}  pid ${pidOf(name) ?? '-'}: ${health}`);
  }

  say(
    on === throwawayUrl
      ? `sign in   ${ui}  ${OWNER.email} / ${OWNER.password}`
      : `sign in   ${ui}  with your own users`,
  );
  say(`logs      ${state}/<server>.log`);
};

/** Plugin dirs given to `up`, else DEV_STACK_PLUGINS (comma-separated, relative to core). */
const pluginDirs = (given: string[]) =>
  given.length
    ? given
    : (setting('DEV_STACK_PLUGINS') ?? '')
        .split(',')
        .map((dir) => dir.trim())
        .filter(Boolean)
        .map((dir) => resolve(root, dir));

const up = async (dirs: string[]) => {
  const plugins = readPlugins(pluginDirs(dirs), firstPluginPort);

  if (isUp()) {
    const running = new Set(startedPlugins().map((plugin) => plugin.dir));

    if (plugins.some((plugin) => !running.has(plugin.dir)))
      throw new Error('Already up with other plugins: vp run dev:stack down first.');

    if ((startedOn() ?? throwawayUrl) !== dataUrl)
      throw new Error('Already up on another Postgres: vp run dev:stack down first.');

    say('Already up.');
    await status();

    return;
  }

  await teardown();
  mkdirSync(state, { recursive: true });

  if (ownPostgres) await reachable(ownPostgres);
  else await startPostgres();

  // Tests create and drop databases, so they get the throwaway server only.
  writeFileSync(
    envFile,
    [
      '# Written by `vp run dev:stack up` for this checkout; `down` removes it.',
      `DATA_URL=${dataUrl}`,
      ...(ownPostgres ? [] : [`DATA_TEST_URL=${throwaway}/postgres`]),
      '',
    ].join('\n'),
  );
  writeFileSync(startedOnFile, dataUrl);

  if (ownPostgres) {
    prepareOwn(db, dataUrl, RUNTIME_ROLE);

    const kept = ownCredentials(plugins, { db, dataUrl, file: credentialsFile });

    const withSecrets = plugins.map((plugin) => ({
      ...plugin,
      secret: kept.get(plugin.name)?.secret ?? plugin.secret,
    }));

    const passwords = new Map([...kept].map(([name, { password }]) => [name, password]));

    writeFileSync(pluginsFile, JSON.stringify(withSecrets));
    await startAll(coreServers(withSecrets));
    await startAll(pluginServersOf(withSecrets, passwords));
    await status();

    return;
  }

  writeFileSync(pluginsFile, JSON.stringify(plugins));

  const token = seed();
  const ofPlugins = pluginServersOf(plugins);

  await startAll(coreServers(plugins));
  await loadExampleData(token);
  await startAll(ofPlugins);
  await installPlugins(plugins, api, token, sleep);
  await status();
};

const down = async () => {
  const own = !onThrowaway();

  await teardown();
  say(
    own
      ? 'Stopped the servers; your Postgres keeps running.'
      : `Stopped the servers and ${stack.container}.`,
  );
};

const [command, ...dirs] = process.argv.slice(2);

if (process.argv[1] === import.meta.filename) {
  const commands = { up: () => up(dirs), down, status };

  if (command !== 'up' && command !== 'down' && command !== 'status') {
    process.stderr.write('Usage: vp run dev:stack up [plugin dir...] | down | status\n');
    process.exitCode = 1;
  } else {
    commands[command]().catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
  }
}
