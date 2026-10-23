// Run explicitly with node --test; requires redis-server and redis-cli.
// Always launches an isolated, nonpersistent Redis on a temporary Unix socket.
import assert from 'node:assert/strict';
import { spawn, execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { RedisStreamsPubSub } from '@mastra/redis-streams';

const exec = promisify(execFile);

test('Redis replay and lease keys have bounded lifetimes, including cleanup failures', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'agent-redis-'));
  const socket = join(directory, 'redis.sock');
  const server = spawn('redis-server', [
    '--port', '0', '--unixsocket', socket, '--unixsocketperm', '700',
    '--save', '', '--appendonly', 'no',
  ], { stdio: 'ignore' });
  const exited = new Promise((resolve, reject) => {
    server.once('exit', resolve);
    server.once('error', reject);
  });
  const command = async (...args) =>
    (await exec('redis-cli', ['-s', socket, '--raw', ...args])).stdout.trim();
  const until = async (predicate) => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (await predicate()) return;
      await delay(30);
    }
    assert.fail('Redis lifecycle condition did not complete');
  };
  const warnings = [];
  const config = {
    keyPrefix: 'core-agents-test',
    redisOptions: { socket: { path: socket } },
    streamIdleTtlMs: 600,
    maxStreamLength: 100,
    maxDeliveryAttempts: 3,
    blockMs: 10,
    logger: { warn: (...args) => warnings.push(args) },
  };
  let bus;
  const key = (topic) => `${config.keyPrefix}:${topic}`;
  const expiring = async (topic) => {
    assert(Number(await command('PTTL', key(topic))) > 0);
  };
  const gone = (topic) => until(async () => await command('EXISTS', key(topic)) === '0');
  try {
    await until(async () => {
      try { return await command('PING') === 'PONG'; } catch { return false; }
    });
    bus = new RedisStreamsPubSub(config);
    const event = { type: 'test', data: { text: 'chunk' } };

    // Every publish has expiry, including the first write and later refreshes.
    await bus.publish('completed', event);
    await expiring('completed');
    await delay(100);
    const previousTtl = Number(await command('PTTL', key('completed')));
    await bus.publish('completed', event);
    assert(Number(await command('PTTL', key('completed'))) > previousTtl);
    await bus.clearTopic('completed');
    assert.equal(await command('EXISTS', key('completed')), '0');

    // Subscribe-before-publish creates a stream/group with expiry as well.
    const ack = async (_event, acknowledge) => acknowledge();
    await bus.subscribe('empty', ack);
    await expiring('empty');
    await bus.unsubscribe('empty', ack);
    await gone('empty');

    // A real permission failure prevents DEL; expiry still reclaims the key.
    await bus.publish('failed-delete', event);
    await command('ACL', 'SETUSER', 'default', '-del');
    try { await bus.clearTopic('failed-delete'); }
    finally { await command('ACL', 'SETUSER', 'default', '+del'); }
    assert(warnings.some(([message]) => message === 'redis-streams: clearTopic failed'));
    await expiring('failed-delete');
    await gone('failed-delete');

    // A producer exits without close/clearTopic: Redis must do the cleanup.
    await exec(process.execPath, ['--input-type=module', '-e',
      `import {RedisStreamsPubSub} from ${JSON.stringify(import.meta.resolve('@mastra/redis-streams'))};
       const bus = new RedisStreamsPubSub(${JSON.stringify({ ...config, logger: undefined })});
       await bus.publish('crashed', ${JSON.stringify(event)}); process.exit(0);`,
    ]);
    await expiring('crashed');
    await gone('crashed');

    // Retry writes also keep expiry; poison events stop refreshing it.
    let deliveries = 0;
    const nack = async (_event, _acknowledge, reject) => { deliveries += 1; await reject(); };
    await bus.subscribe('retry', nack);
    await bus.publish('retry', event);
    await until(async () => deliveries === 3);
    await expiring('retry');
    await bus.unsubscribe('retry', nack);
    await gone('retry');

    // Ownership-checked release cannot delete another replica's live lease.
    await bus.acquireLease('run', 'owner-a', 600);
    await expiring('lease:run');
    await bus.releaseLease('run', 'owner-b');
    assert.equal(await bus.getLeaseOwner('run'), 'owner-a');
    await bus.transferLease('run', 'owner-a', 'owner-b', 600);
    await expiring('lease:run');
    await bus.releaseLease('run', 'owner-b');
    assert.equal(await bus.getLeaseOwner('run'), undefined);
    await bus.acquireLease('abandoned', 'owner-a', 300);
    await gone('lease:abandoned');
    assert.equal(await command('DBSIZE'), '0');
  } finally {
    await bus?.close();
    server.kill('SIGTERM');
    await exited;
    await rm(directory, { recursive: true, force: true });
  }
});
