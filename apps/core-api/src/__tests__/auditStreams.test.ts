import { createHmac } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { formatBatch } from '~/modules/audit/streams';
import { hashPassword } from '~/modules/auth/password';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, currentToken, describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';

describe('audit stream formats', () => {
  const entry = {
    id: 'a1',
    seq: 7,
    prevHash: 'p',
    hash: 'h',
    createdAt: '2026-11-12T00:00:00.000Z',
    source: 'core',
    action: 'customer.deleted',
    actor: { type: 'user' as const, id: 'u1' },
    target: { type: 'customer', id: 'c1', label: 'Bat' },
    changes: null,
    metadata: null,
    ip: '1.2.3.4',
    userAgent: null,
  };

  const context = { streamId: 's1', organization: { id: 'o1', subdomain: 'acme' } };

  it('speaks erxes, Datadog and Splunk, and names gaps in each', () => {
    expect(
      JSON.parse(formatBatch('erxes', context, [entry], { fromSeq: 3, toSeq: 6 })),
    ).toMatchObject({
      stream: 's1',
      gap: { fromSeq: 3, toSeq: 6 },
      entries: [{ seq: 7, hash: 'h', prevHash: 'p' }],
    });

    const datadog = JSON.parse(formatBatch('datadog', context, [entry], { fromSeq: 3, toSeq: 6 }));

    expect(datadog).toHaveLength(2);
    expect(datadog[0]).toMatchObject({
      erxes: { action: 'audit.stream_gap', metadata: { fromSeq: 3, toSeq: 6 } },
    });
    expect(datadog[1]).toMatchObject({
      ddsource: 'erxes',
      hostname: 'acme',
      message: 'customer.deleted Bat',
      timestamp: Date.parse(entry.createdAt),
    });

    const splunk = formatBatch('splunk', context, [entry], null)
      .split('\n')
      .map((line) => JSON.parse(line));

    expect(splunk).toEqual([
      {
        time: Date.parse(entry.createdAt) / 1000,
        host: 'acme',
        source: 'erxes',
        sourcetype: 'erxes:audit',
        event: entry,
      },
    ]);
  });
});

describeWithDb('audit streaming and security alerts', { timeout: 300_000 }, () => {
  useTestDatabase();

  let server: Server;
  let receiver: Server;
  let base = '';
  let receiverUrl = '';
  let orgId = '';
  let ownerId = '';
  let owner = '';
  let receiverStatus = 200;
  const received: { body: string; headers: Record<string, string | string[] | undefined> }[] = [];

  const call = async (
    token: string,
    method: string,
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
  ) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        'content-type': 'application/json',
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const securityNotices = async (userId: string) => {
    const { notifications } = await import('@erxes/core-db');
    const { and, eq, like } = await import('drizzle-orm');

    return adminDb()
      .select({ kind: notifications.kind, title: notifications.title })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), like(notifications.kind, 'core.security.%')));
  };

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn', passwordHash: await hashPassword('Owner-pass-1') },
    });

    orgId = acme.organization.id;
    ownerId = acme.owner.id;
    owner = await currentToken(ownerId, orgId);
    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    receiver = createServer((req, res) => {
      let body = '';

      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        if (receiverStatus === 200) received.push({ body, headers: req.headers });
        res.writeHead(receiverStatus).end();
      });
    }).listen(0);
    receiverUrl = `http://127.0.0.1:${(receiver.address() as AddressInfo).port}/logs`;
  });

  afterAll(async () => {
    for (const each of [server, receiver]) {
      each.closeAllConnections();
      await new Promise<void>((resolve) => each.close(() => resolve()));
    }
  });

  it('streams the whole chain in order, signed, resuming after the endpoint fails', async () => {
    // Something already in the log, to stream from the beginning.
    await call(owner, 'POST', '/roles', { name: 'Support', permissions: ['contacts.view'] });

    const created = await call(owner, 'POST', '/audit/streams', {
      name: 'SIEM',
      url: receiverUrl,
      authHeader: { name: 'DD-API-KEY', value: 'k-123' },
      from: 'beginning',
    });

    expect(created.status).toBe(201);
    expect(created.body.secret).toMatch(/^whsec_/);
    expect(created.body.stream).toMatchObject({ authHeaderName: 'DD-API-KEY', status: 'active' });

    await settle();

    const first = received.map((item) => JSON.parse(item.body));

    expect(first.length).toBeGreaterThan(0);

    const entries = first.flatMap((batch) => batch.entries);

    // Contiguous from 1, and each entry continues the previous one's hash.
    expect(entries.map((entry: { seq: number }) => entry.seq)).toEqual(
      entries.map((_: unknown, index: number) => index + 1),
    );
    entries
      .slice(1)
      .forEach((entry: { prevHash: string }, index: number) =>
        expect(entry.prevHash).toBe(entries[index].hash),
      );
    expect(entries.some((entry: { action: string }) => entry.action === 'role.created')).toBe(true);

    // Signed like webhooks, with the service's own header.
    const { body, headers } = received[0]!;
    const [, t, v1] = /t=(\d+),v1=([0-9a-f]+)/.exec(String(headers['erxes-signature']))!;

    expect(createHmac('sha256', created.body.secret).update(`${t}.${body}`).digest('hex')).toBe(v1);
    expect(headers['dd-api-key']).toBe('k-123');

    // The endpoint goes down: nothing moves, the failure shows.
    const before = (await call(owner, 'GET', '/audit/streams')).body.data[0];

    receiverStatus = 503;
    await call(owner, 'POST', '/roles', { name: 'Sales', permissions: ['contacts.view'] });
    // Wake the loop now instead of waiting for its next round.
    await call(owner, 'PATCH', `/audit/streams/${created.body.stream.id}`, { status: 'paused' });
    await call(owner, 'PATCH', `/audit/streams/${created.body.stream.id}`, { status: 'active' });
    await settle();

    const down = (await call(owner, 'GET', '/audit/streams')).body.data[0];

    expect(down.cursorSeq).toBe(before.cursorSeq);
    expect(down.consecutiveFailures).toBeGreaterThan(0);
    expect(down.lastError).toBe('HTTP 503');
    expect(down.pending).toBeGreaterThan(0);

    // Back up: everything waiting arrives, still contiguous.
    receiverStatus = 200;
    await call(owner, 'PATCH', `/audit/streams/${created.body.stream.id}`, { status: 'paused' });
    await call(owner, 'PATCH', `/audit/streams/${created.body.stream.id}`, { status: 'active' });
    await settle();

    const all = received.flatMap(
      (item) => JSON.parse(item.body).entries as { seq: number; action: string }[],
    );

    expect(all.map((entry) => entry.seq)).toEqual(all.map((_, index) => index + 1));
    expect(all.map((entry) => entry.action)).toContain('audit.stream_paused');
    expect((await call(owner, 'GET', '/audit/streams')).body.data[0]).toMatchObject({
      pending: 0,
      consecutiveFailures: 0,
      lastError: null,
    });

    // A test entry goes out without moving anything.
    expect(
      (await call(owner, 'POST', `/audit/streams/${created.body.stream.id}/test`)).body,
    ).toMatchObject({ ok: true, status: 200 });

    // Owners were told the stream was set up and changed.
    expect((await securityNotices(ownerId)).length).toBe(0); // the owner did it: told by email, not in their own inbox
  });

  it('alerts owners and members: admins made, failed sign-ins, new devices', async () => {
    const { users, newId } = await import('@erxes/core-db');
    const { loggedEmails } = await import('~/modules/email/email');
    const secondOwner = newId();
    const member = newId();

    await adminDb()
      .insert(users)
      .values([
        { id: secondOwner, orgId, email: 'o2@acme.mn', role: 'owner', status: 'active' },
        {
          id: member,
          orgId,
          email: 'm@acme.mn',
          role: 'member',
          status: 'active',
          passwordHash: await hashPassword('Member-pass-1'),
        },
      ]);

    // Made admin: the other owner hears, in erxes and by email.
    expect((await call(owner, 'PATCH', `/users/${member}`, { role: 'admin' })).status).toBe(200);
    expect(await securityNotices(secondOwner)).toEqual([
      expect.objectContaining({ kind: 'core.security.alert', title: 'm@acme.mn is now an admin' }),
    ]);

    // Someone guessing a password (the alert line is 3 in tests).
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await call('', 'POST', '/auth/sign-in', { email: 'm@acme.mn', password: 'wrong' });
    }

    expect((await securityNotices(secondOwner)).map((row) => row.title)).toContain(
      '3 failed sign-ins to m@acme.mn in 15 minutes',
    );

    // A sign-in from a device and address never seen: the member is told; a known device isn't news.
    const mac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605 Safari/605';
    const windows = 'Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/130.0 Safari/537';

    const signIn = async (agent: string, ip: string) =>
      (
        await call(
          '',
          'POST',
          '/auth/sign-in',
          { email: 'm@acme.mn', password: 'Member-pass-1' },
          { 'user-agent': agent, 'x-forwarded-for': ip },
        )
      ).status;

    expect(await signIn(mac, '198.51.100.1')).toBe(200);
    expect(await signIn(mac, '198.51.100.1')).toBe(200);
    expect(await securityNotices(member)).toEqual([]);
    expect(await signIn(windows, '203.0.113.9')).toBe(200);
    expect(await securityNotices(member)).toEqual([
      expect.objectContaining({
        kind: 'core.security.new_sign_in',
        title: 'New sign-in to your account from Chrome on Windows',
      }),
    ]);
    expect(await signIn(windows, '203.0.113.77')).toBe(200);
    expect(await securityNotices(member)).toHaveLength(1);

    await settle();
    expect(
      loggedEmails.some(
        (email) => email.to === 'o2@acme.mn' && email.subject.includes('m@acme.mn is now an admin'),
      ),
    ).toBe(true);
    expect(
      loggedEmails.some(
        (email) =>
          email.to === 'o@acme.mn' &&
          email.subject.includes('Audit log streaming to SIEM was created'),
      ),
    ).toBe(true);
    expect(
      loggedEmails.some(
        (email) => email.to === 'm@acme.mn' && email.subject.includes('New sign-in'),
      ),
    ).toBe(true);
  });
});
