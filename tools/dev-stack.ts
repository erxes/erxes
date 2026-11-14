/**
 * A throwaway stack for this checkout: Postgres 18 in Docker on tmpfs, migrated, with the
 * e2e owner's organisation and its example data, and the API and UI dev servers.
 *   vp run dev:stack up | down | status
 * The container name and the ports come from the checkout's path, so parallel checkouts
 * never collide. `up` writes `.env.local`, which `vp run test` and the dev servers read.
 */
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { OWNER } from '../e2e/owner.ts';

const root = resolve(import.meta.dirname, '..');
const id = createHash('sha256').update(root).digest('hex').slice(0, 8);
const base = 20_000 + (Number.parseInt(id, 16) % 1000) * 10;

/** What `up` starts for this checkout. `vp run doctor` checks the ports are free. */
export const stack = {
  container: `erxes-dev-${id}`,
  ports: { postgres: base, api: base + 1, ui: base + 2 },
};

// No password: the throwaway server listens on 127.0.0.1 only and trusts local connections.
const postgres = `postgres://erxes@127.0.0.1:${stack.ports.postgres}`;
const api = `http://localhost:${stack.ports.api}`;
const ui = `http://localhost:${stack.ports.ui}`;
const state = resolve(root, '.scratch/dev-stack');
const envFile = resolve(root, '.env.local');

/** The dev servers `up` starts, each in its own process group, so `down` stops exactly it. */
const servers = {
  api: {
    filter: '@erxes/api',
    env: { PORT: String(stack.ports.api), DATA_URL: `${postgres}/erxes` },
    ready: `${api}/ready`,
  },
  ui: {
    filter: '@erxes/web',
    env: { WEB_PORT: String(stack.ports.ui), CORE_API_URL: api },
    ready: ui,
  },
};

type Server = keyof typeof servers;

const say = (line: string) => process.stdout.write(`${line}\n`);

const run = (command: string, args: string[], env: NodeJS.ProcessEnv = {}) =>
  execFileSync(command, args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const pidFile = (server: Server) => resolve(state, `${server}.pid`);
const logFile = (server: Server) => resolve(state, `${server}.log`);

const pidOf = (server: Server) => {
  try {
    return Number(readFileSync(pidFile(server), 'utf8'));
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

const tail = (server: Server) => readFileSync(logFile(server), 'utf8').split('\n').slice(-30);

/** Waits for a server to answer; fails with its log when it exits or takes 3 minutes. */
const waitFor = async (server: Server) => {
  const deadline = Date.now() + 180_000;

  while (!(await answers(servers[server].ready))) {
    if (!alive(pidOf(server)) || Date.now() > deadline)
      throw new Error(`${server} did not start. ${logFile(server)}:\n${tail(server).join('\n')}`);

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

const startServer = (server: Server) => {
  const out = openSync(logFile(server), 'w');
  const env = { ...process.env, NODE_ENV: 'development', ...servers[server].env };

  const child = spawn('pnpm', ['--filter', servers[server].filter, 'dev'], {
    cwd: root,
    env,
    detached: true,
    stdio: ['ignore', out, out],
  });

  writeFileSync(pidFile(server), String(child.pid));
  child.unref();
};

/** The organisation and owner (migrating first), then example data through the API. */
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

  return token;
};

const loadExampleData = async (token: string) => {
  const response = await fetch(`${api}/core/v1/auth/onboarded`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ exampleData: true, language: 'en' }),
  });

  if (!response.ok) throw new Error(`example data: ${response.status} ${await response.text()}`);
};

const stop = async (server: Server) => {
  const pid = pidOf(server);

  if (pid && alive(pid)) {
    process.kill(-pid, 'SIGTERM');

    for (let waited = 0; waited < 20 && alive(pid); waited++) await sleep(500);

    if (alive(pid)) process.kill(-pid, 'SIGKILL');
  }

  rmSync(pidFile(server), { force: true });
};

/** Stops only what `up` started here: its two process groups and its container. */
const teardown = async () => {
  await Promise.all([stop('api'), stop('ui')]);
  run('docker', ['rm', '-f', stack.container]);
  rmSync(envFile, { force: true });
};

const down = async () => {
  await teardown();
  say(`Stopped the API, the UI and ${stack.container}.`);
};

export const isUp = () =>
  containerStatus() === 'running' && alive(pidOf('api')) && alive(pidOf('ui'));

const status = async () => {
  say(`postgres  ${postgres}/erxes  ${stack.container}: ${containerStatus()}`);

  for (const server of ['api', 'ui'] as const) {
    const pid = pidOf(server);
    const health = (await answers(servers[server].ready)) ? 'answers' : 'not answering';

    say(`${server.padEnd(8)}  ${servers[server].ready}  pid ${pid ?? '-'}: ${health}`);
  }

  say(`sign in   ${ui}  ${OWNER.email} / ${OWNER.password}`);
  say(`logs      ${logFile('api')}, ${logFile('ui')}`);
};

const up = async () => {
  if (isUp()) {
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

  const token = seed();

  startServer('api');
  startServer('ui');
  await waitFor('api');
  await loadExampleData(token);
  await waitFor('ui');
  await status();
};

const commands = { up, down, status };
const command = process.argv[2];

if (process.argv[1] === import.meta.filename) {
  if (command !== 'up' && command !== 'down' && command !== 'status') {
    process.stderr.write('Usage: vp run dev:stack up | down | status\n');
    process.exitCode = 1;
  } else {
    commands[command]().catch((error: unknown) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
  }
}
