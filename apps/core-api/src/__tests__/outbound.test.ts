import { sql } from 'drizzle-orm';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test';
import { createApp } from '~/app';
import { postOutbound } from '~/lib/outbound';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';

describeWithDb('calls out over the network', () => {
  useTestDatabase();

  let server: Server;
  let receiver: Server;
  let base = '';
  let receiverUrl = '';
  let orgId = '';
  let owner = '';
  /** Requests the receiver holds until the test answers them. */
  const waiting: ServerResponse<IncomingMessage>[] = [];

  const call = async (method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${owner}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: await response.json() };
  };

  /** Connections of the API under test holding a transaction open while doing nothing. */
  const idleInTransaction = async () => {
    const result = await adminDb().execute<{ count: number }>(sql`
      select count(*)::int as count from pg_stat_activity
      where datname = current_database() and application_name = 'erxes-core-test'
        and state = 'idle in transaction'
    `);

    return result.rows[0]?.count;
  };

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn', passwordHash: await hashPassword('Owner-pass-1') },
    });

    orgId = acme.organization.id;
    owner = await currentToken(acme.owner.id, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    receiver = createServer((req, res) => {
      req.resume();
      req.on('end', () => waiting.push(res));
    }).listen(0);
    receiverUrl = `http://127.0.0.1:${(receiver.address() as AddressInfo).port}/logs`;
  });

  afterAll(async () => {
    for (const each of [server, receiver]) {
      each.closeAllConnections();
      await new Promise<void>((resolve) => each.close(() => resolve()));
    }
  });

  it('refuses to call out inside a database transaction', async () => {
    const { withOrg } = await import('@erxes/core-db');

    await expect(
      withOrg(orgId, () => postOutbound(receiverUrl, '{}', { 'content-type': 'application/json' })),
    ).rejects.toThrow('inside a database transaction');
    expect(waiting).toHaveLength(0);
  });

  it('tests an audit stream with no transaction open while the endpoint answers', async () => {
    const created = await call('POST', '/audit/streams', {
      name: 'SIEM',
      url: receiverUrl,
      from: 'now',
    });

    expect(created.status).toBe(201);

    const tested = call('POST', `/audit/streams/${created.body.stream.id}/test`);

    // The slow endpoint has the request; nothing in the database waits on it.
    await vi.waitFor(() => expect(waiting).toHaveLength(1));
    expect(await idleInTransaction()).toBe(0);

    waiting.shift()?.writeHead(200).end();
    expect((await tested).body).toMatchObject({ ok: true, status: 200 });
  });

  it('delivers a stream batch with no transaction open while the endpoint answers', async () => {
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { JOBS } = await import('~/modules/jobs/registry');

    const delivering = processJobs(JOBS);

    await vi.waitFor(() => expect(waiting).toHaveLength(1));
    expect(await idleInTransaction()).toBe(0);

    waiting.shift()?.writeHead(200).end();
    await delivering;

    const [stream] = (await call('GET', '/audit/streams')).body.data;

    expect(stream).toMatchObject({ pending: 0, lastError: null, consecutiveFailures: 0 });
  });
});
