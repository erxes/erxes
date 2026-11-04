import { spawn, type ChildProcess } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import readline from 'node:readline';

const WORKERD_BIN = require.resolve('workerd/bin/workerd');

export const createToken = () => randomBytes(32).toString('hex');

type WorkerdOptions = {
  // Where the supervisor's Host entrypoint reaches the runtime's /db.
  hostPort: number;
  supervisorPort: number;
  token: string;
};

const forwardLines = (stream: NodeJS.ReadableStream, prefix: string) => {
  readline
    .createInterface({ input: stream })
    .on('line', (line) => console.log(`${prefix} ${line}`));
};

// Writes the filled-in config and supervisor into a temp dir and starts workerd on it.
export const startWorkerd = async ({
  hostPort,
  supervisorPort,
  token,
}: WorkerdOptions): Promise<ChildProcess> => {
  const dir = await mkdtemp(path.join(tmpdir(), 'extensions-runtime-'));
  const template = await readFile(path.join(__dirname, 'config.capnp'), 'utf8');

  const config = template
    .replace('__TOKEN__', token)
    .replace('__HOST_PORT__', String(hostPort))
    .replace('__SUPERVISOR_PORT__', String(supervisorPort));

  const configPath = path.join(dir, 'config.capnp');
  await writeFile(configPath, config);
  await copyFile(
    path.join(__dirname, 'supervisor.js'),
    path.join(dir, 'supervisor.js'),
  );

  const child = spawn(WORKERD_BIN, ['serve', configPath, '--experimental'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  forwardLines(child.stdout, `[workerd:${supervisorPort}]`);
  forwardLines(child.stderr, `[workerd:${supervisorPort}]`);

  const killChild = () => child.kill();
  const cleanUp = () => {
    process.off('exit', killChild);
    void rm(dir, { recursive: true, force: true });
  };
  process.once('exit', killChild);
  child.once('exit', cleanUp);
  // A failed spawn (ENOENT, EACCES, no resources) arrives here, not as a throw;
  // unhandled, it would crash the runtime for every tenant.
  child.once('error', (error) => {
    console.error(`[workerd:${supervisorPort}] failed to start`, error);
    cleanUp();
  });

  return child;
};

// Resolves once anything answers on the supervisor socket.
export const waitUntilListening = async (url: string, timeoutMs = 10_000) => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  throw new Error(`workerd did not listen on ${url} within ${timeoutMs}ms`);
};
