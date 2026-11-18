import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { Client } from 'pg';
import { describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '#/config.ts';
import { pool } from '#/db/client.ts';
import { logger } from '#/logger.ts';

const Line = z.object({
  level: z.number(),
  msg: z.string(),
  err: z.object({ message: z.string() }).optional(),
});

/** The log lines of `node src/main.ts` against the test database, and its exit code. */
const startApi = async () => {
  const child = spawn(process.execPath, ['src/main.ts'], {
    cwd: new URL('../..', import.meta.url),
    // CORE_URL is a port nothing listens on (vite.config.ts).
    env: {
      DATA_URL: config.dataUrl,
      CORE_URL: config.coreUrl,
      PLUGIN_SECRET: config.pluginSecret,
      LOG_LEVEL: 'info',
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  });

  let output = '';

  child.stdout.on('data', (chunk: Buffer) => {
    output += chunk.toString();
  });

  const [code] = z
    .tuple([z.number().nullable()])
    .rest(z.unknown())
    .parse(await once(child, 'close'));

  const lines = output
    .split('\n')
    .filter((line) => line.startsWith('{'))
    .map((line) => Line.parse(JSON.parse(line)));

  return { code, lines };
};

describe('startup', () => {
  // Starts a Node process, which migrates and asks core twice.
  it(
    'logs why and exits with 1 when core does not take the manifest',
    { timeout: 30_000 },
    async () => {
      const { code, lines } = await startApi();
      const fatal = lines.find((line) => line.level === 60);

      expect(code).toBe(1);
      expect(fatal?.msg).toBe('failed to start');
      expect(fatal?.err?.message).toContain(
        'did not take the manifest: check CORE_URL and PLUGIN_SECRET',
      );
    },
  );

  it('logs a broken idle database connection and keeps running', async () => {
    const failed = vi.spyOn(logger, 'error');
    const anError: unknown = expect.any(Error);
    const { rows } = await pool.query<{ pid: number }>('select pg_backend_pid() as pid');
    const admin = new Client({ connectionString: config.dataUrl });

    // Postgres ends the pool's idle connection, as on a restart or failover.
    await admin.connect();
    await admin.query('select pg_terminate_backend($1)', [rows[0]?.pid]);
    await admin.end();

    await vi.waitFor(() =>
      expect(failed).toHaveBeenCalledWith({ err: anError }, 'idle database connection failed'),
    );
    expect((await pool.query<{ one: number }>('select 1 as one')).rows).toEqual([{ one: 1 }]);
  });
});
