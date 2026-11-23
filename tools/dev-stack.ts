/**
 * A throwaway stack for this checkout: Postgres 18 in Docker on tmpfs, migrated, with the
 * e2e owner's organisation and its example data, and the API and UI dev servers.
 *   vp run dev:stack up [plugin dir...] | down | status
 * Each plugin dir is a plugin checkout (`pnpm create erxes`): `up` gives it a database role and a
 * secret, starts its API and UI dev servers, and installs it in the e2e organisation.
 * The container name and the ports come from the checkout's path, so parallel checkouts
 * never collide. `up` writes `.env.local`, which `vp run test` and the dev servers read.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { OWNER } from '../e2e/owner.ts';
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

// No password: the throwaway server listens on 127.0.0.1 only and trusts local connections.
const postgres = `postgres://erxes@127.0.0.1:${stack.ports.postgres}`;
const api = `http://localhost:${stack.ports.api}`;
const ui = `http://localhost:${stack.ports.ui}`;
const state = resolve(root, '.scratch/dev-stack');
const envFile = resolve(root, '.env.local');
const pluginsFile = resolve(state, 'plugins.json');

/**
 * The API acts as this role, under row level security like production's runtime role, so
 * a query that is slow or refused there is slow or refused here. It migrates as `erxes`.
 */
const RUNTIME_ROLE = 'erxes_dev_runtime';

type Server = DevServer;

/** Core's dev servers, told about the plugins. */
const coreServers = (plugins: DevPlugin[]): Record<string, Server> => ({
  api: {
    cwd: root,
    args: ['--filter', '@erxes/api', 'dev'],
    env: {
      PORT: String(stack.ports.api),
      DATA_URL: `${postgres}/erxes`,
      DATA_ROLE: RUNTIME_ROLE,
      DATA_RUNTIME_ROLE: RUNTIME_ROLE,
      APP_URL: ui,
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

const pidFile = (name: string) => resolve(state, `${name}.pid`);
const logFile = (name: string) => resolve(state, `${name}.log`);

const pidOf = (name: string) => {
  try {
    return Number(readFileSync(pidFile(name), 'utf8'));
  } catch {
    return undefined;
  }
};

/** Whether the server's process group still has a process. */
const alive = (pid: number | undefined) => {
  if (!pid) return false;

  try {
    process.kill(-pid, 0);

    return true;
  } catch {
    return false;
  }
};

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

const answers = async (url: string) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
};

const tail = (name: string) => readFileSync(logFile(name), 'utf8').split('\n').slice(-30);

/** Waits for a server to answer; fails with its log when it exits or takes 3 minutes. */
const waitFor = async (name: string, server: Server) => {
  const deadline = Date.now() + 180_000;

  while (!(await answers(server.ready))) {
    if (!alive(pidOf(name)) || Date.now() > deadline)
      throw new Error(`${name} did not start. ${logFile(name)}:\n${tail(name).join('\n')}`);

    await sleep(500);
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

const startServer = (name: string, server: Server) => {
  const out = openSync(logFile(name), 'w');
  const env = { ...process.env, NODE_ENV: 'development', ...server.env };

  const child = spawn('pnpm', server.args, {
    cwd: server.cwd,
    env,
    detached: true,
    stdio: ['ignore', out, out],
  });

  writeFileSync(pidFile(name), String(child.pid));
  child.unref();
};

const startAll = async (servers: Record<string, Server>) => {
  for (const [name, server] of Object.entries(servers)) startServer(name, server);

  await Promise.all(Object.entries(servers).map(([name, server]) => waitFor(name, server)));
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
    { NODE_ENV: 'development', DATA_URL: `${postgres}/erxes` },
  );

  const token = /^token\s+(\S+)/m.exec(printed)?.[1];

  if (!token) throw new Error(`bootstrap printed no token:\n${printed}`);

  run('pnpm', ['--silent', 'db:grant', RUNTIME_ROLE], {
    NODE_ENV: 'development',
    DATA_URL: `${postgres}/erxes`,
  });

  return token;
};

/** Each plugin's API and UI servers, with a fresh password for its database role. */
const pluginServersOf = (plugins: DevPlugin[]) => {
  if (!plugins.length) return {};

  const passwords = rolePasswords(
    run('pnpm', ['--silent', 'db:plugin-role', ...plugins.map((plugin) => plugin.name)], {
      DATA_URL: `${postgres}/erxes`,
    }),
  );

  const core = {
    dataUrl: (role: string, password: string) =>
      `postgres://${role}:${password}@127.0.0.1:${stack.ports.postgres}/erxes`,
    api,
    ui,
  };

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

const stop = async (name: string) => {
  const pid = pidOf(name);

  if (pid && alive(pid)) {
    process.kill(-pid, 'SIGTERM');

    for (let waited = 0; waited < 20 && alive(pid); waited++) await sleep(500);

    if (alive(pid)) process.kill(-pid, 'SIGKILL');
  }

  rmSync(pidFile(name), { force: true });
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
};

export const isUp = () =>
  containerStatus() === 'running' && alive(pidOf('api')) && alive(pidOf('ui'));

const status = async () => {
  say(`postgres  ${postgres}/erxes  ${stack.container}: ${containerStatus()}`);

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

  say(`sign in   ${ui}  ${OWNER.email} / ${OWNER.password}`);
  say(`logs      ${state}/<server>.log`);
};

const up = async (dirs: string[]) => {
  const plugins = readPlugins(dirs, firstPluginPort);

  if (isUp()) {
    const running = new Set(startedPlugins().map((plugin) => plugin.dir));

    if (plugins.some((plugin) => !running.has(plugin.dir)))
      throw new Error('Already up with other plugins: vp run dev:stack down first.');

    say('Already up.');
    await status();

    return;
  }

  await teardown();
  mkdirSync(state, { recursive: true });
  await startPostgres();
  writeFileSync(
    envFile,
    `# Written by \`vp run dev:stack up\` for this checkout; \`down\` removes it.\nDATA_URL=${postgres}/erxes\nDATA_TEST_URL=${postgres}/postgres\n`,
  );
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
  await teardown();
  say(`Stopped the servers and ${stack.container}.`);
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
