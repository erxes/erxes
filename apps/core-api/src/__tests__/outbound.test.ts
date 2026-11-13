import { withOrg } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { once } from 'node:events';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test';
import { postOutbound } from '~/lib/outbound';
import { processJobs } from '~/modules/jobs/jobs';
import { JOBS } from '~/modules/jobs/registry';
import { adminDb, describeWithDb, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** Connections of the API under test holding a transaction open while doing nothing. */
const idleInTransaction = async () => {
  const result = await adminDb().execute<{ count: number }>(sql`
    select count(*)::int as count from pg_stat_activity
    where datname = current_database() and application_name = 'erxes-core-test'
      and state = 'idle in transaction'
  `);

  return result.rows[0]?.count;
};

describeWithDb('calls out over the network', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let receiver: Server;
  let receiverUrl = '';
  /** Requests the receiver holds until the test answers them. */
  const waiting: ServerResponse[] = [];

  beforeAll(async () => {
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => waiting.push(res));
    }).listen(0);
    await once(receiver, 'listening');

    const address = receiver.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    receiverUrl = `http://127.0.0.1:${address.port}/logs`;
  });

  afterAll(async () => {
    receiver.closeAllConnections();
    await new Promise<void>((resolve) => receiver.close(() => resolve()));
  });

  it('refuses to call out inside a database transaction', async () => {
    await expect(
      withOrg(t.ids.org, () =>
        postOutbound(receiverUrl, '{}', { 'content-type': 'application/json' }),
      ),
    ).rejects.toThrow('inside a database transaction');
    expect(waiting).toHaveLength(0);
  });

  it('tests an audit stream with no transaction open while the endpoint answers', async () => {
    const { stream } = await t
      .owner()
      .audit.createStream({ name: 'SIEM', url: receiverUrl, from: 'now' });

    const tested = t.owner().audit.testStream({ id: stream.id });

    // The slow endpoint has the request; nothing in the database waits on it.
    await vi.waitFor(() => expect(waiting).toHaveLength(1));
    expect(await idleInTransaction()).toBe(0);

    waiting.shift()?.writeHead(200).end();
    expect(await tested).toMatchObject({ ok: true, status: 200 });
  });

  it('delivers a stream batch with no transaction open while the endpoint answers', async () => {
    const delivering = processJobs(JOBS);

    await vi.waitFor(() => expect(waiting).toHaveLength(1));
    expect(await idleInTransaction()).toBe(0);

    waiting.shift()?.writeHead(200).end();
    await delivering;

    const listed = await t.owner().audit.streams({});

    expect(listed.data[0]).toMatchObject({ pending: 0, lastError: null, consecutiveFailures: 0 });
  });
});
