/**
 * The dev servers `vp run dev:stack up` starts: each in its own process group, with its pid and
 * log in the stack's state folder, so `down` stops exactly what `up` started.
 */
import { spawn } from 'node:child_process';
import { openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import type { DevServer } from './dev-stack-plugins.ts';

/** Whether the URL answers with a 2xx within 2 seconds. */
export const answers = async (url: string) => {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(2000) })).ok;
  } catch {
    return false;
  }
};

/** Whether the server's process group still has a process. */
export const alive = (pid: number | undefined) => {
  if (!pid) return false;

  try {
    process.kill(-pid, 0);

    return true;
  } catch {
    return false;
  }
};

/** Starts, waits for and stops the servers whose pids and logs live in `state`. */
export const serversIn = (state: string) => {
  const pidFile = (name: string) => resolve(state, `${name}.pid`);
  const logFile = (name: string) => resolve(state, `${name}.log`);

  const pidOf = (name: string) => {
    try {
      return Number(readFileSync(pidFile(name), 'utf8'));
    } catch {
      return undefined;
    }
  };

  const tail = (name: string) => readFileSync(logFile(name), 'utf8').split('\n').slice(-30);

  /** Waits for a server to answer; fails with its log when it exits or takes 3 minutes. */
  const waitFor = async (name: string, server: DevServer) => {
    const deadline = Date.now() + 180_000;

    while (!(await answers(server.ready))) {
      if (!alive(pidOf(name)) || Date.now() > deadline)
        throw new Error(`${name} did not start. ${logFile(name)}:\n${tail(name).join('\n')}`);

      await sleep(500);
    }
  };

  const start = (name: string, server: DevServer) => {
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

  const startAll = async (servers: Record<string, DevServer>) => {
    for (const [name, server] of Object.entries(servers)) start(name, server);

    await Promise.all(Object.entries(servers).map(([name, server]) => waitFor(name, server)));
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

  return { pidOf, startAll, stop };
};
