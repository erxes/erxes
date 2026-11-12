import { createHmac } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { createApp } from '~/app';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { currentToken, describeWithDb, useTestDatabase } from './db';

describeWithDb('webhooks', () => {
  useTestDatabase();

  let api: Server;
  let receiver: Server;
  let base = '';
  let hookUrl = '';
  let owner = '';
  let memberToken = '';
  let answer = 200;
  const received: { headers: Record<string, string | string[] | undefined>; body: string }[] = [];

  const call = async (token: string, method: string, path: string, body?: unknown) => {
    const response = await fetch(`${base}/core/v1${path}`, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  };

  const flush = async () => {
    const { processEvents } = await import('~/modules/events/processor');
    const { processJobs } = await import('~/modules/jobs/jobs');
    const { JOBS } = await import('~/modules/jobs/registry');

    // Until a round finds nothing (an event committed a moment ago may need one more look).
    let idle = 0;

    for (let round = 0; round < 12 && idle < 2; round += 1) {
      const handled = (await processEvents()) + (await processJobs(JOBS));

      idle = handled ? 0 : idle + 1;
    }
  };

  beforeAll(async () => {
    const { users, newId } = await import('@erxes/core-db');
    const { adminDb } = await import('./db');

    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    const memberId = newId();

    await adminDb().insert(users).values({
      id: memberId,
      orgId: acme.organization.id,
      email: 'm@acme.mn',
      role: 'member',
      status: 'active',
    });
    owner = await currentToken(acme.owner.id, acme.organization.id);
    memberToken = await currentToken(memberId, acme.organization.id);
    api = createApp().listen(0);
    base = `http://127.0.0.1:${(api.address() as AddressInfo).port}`;
    receiver = createServer((req, res) => {
      let body = '';

      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        received.push({ headers: req.headers, body });
        res.statusCode = answer;
        res.end(answer === 200 ? 'ok' : 'boom');
      });
    }).listen(0);
    hookUrl = `http://127.0.0.1:${(receiver.address() as AddressInfo).port}/hook`;
  });

  afterAll(async () => {
    api.closeAllConnections();
    await new Promise<void>((resolve) => api.close(() => resolve()));
    await new Promise<void>((resolve) => receiver.close(() => resolve()));
  });

  it(
    'delivers subscribed events, signed with the endpoint secret',
    { timeout: 180_000 },
    async () => {
      expect(
        (
          await call(memberToken, 'POST', '/webhooks', {
            url: hookUrl,
            eventTypes: ['core.customer.*'],
          })
        ).status,
      ).toBe(403);

      const created = await call(owner, 'POST', '/webhooks', {
        url: hookUrl,
        eventTypes: ['core.customer.*'],
      });

      expect(created.status).toBe(201);
      expect(created.body.secret).toMatch(/^whsec_/);

      const secret = created.body.secret as string;

      await call(owner, 'POST', '/customers', {
        firstName: 'Hooked',
        primaryEmail: 'hooked@mail.mn',
      });
      await call(owner, 'POST', '/companies', { primaryName: 'Not subscribed' });
      await flush();

      const deliveries = received.filter((entry) =>
        JSON.parse(entry.body).type.startsWith('core.'),
      );

      expect(deliveries.map((entry) => JSON.parse(entry.body).type)).toEqual([
        'core.customer.created',
      ]);

      const [first] = deliveries;
      const signature = String(first!.headers['erxes-signature']);
      const [, t, v1] = /^t=(\d+),v1=([a-f0-9]{64})$/.exec(signature)!;

      expect(createHmac('sha256', secret).update(`${t}.${first!.body}`).digest('hex')).toBe(v1);
      expect(JSON.parse(first!.body).data).toMatchObject({
        type: 'core.customer.created',
        subject: { type: 'customer' },
      });

      const log = await call(owner, 'GET', `/webhooks/${created.body.webhook.id}/deliveries`);

      expect(log.body.data[0]).toMatchObject({
        status: 'succeeded',
        responseStatus: 200,
        attempts: 1,
      });
    },
  );

  it(
    'retries a failing endpoint with backoff and keeps every attempt in the log',
    { timeout: 240_000 },
    async () => {
      const created = await call(owner, 'POST', '/webhooks', {
        url: hookUrl,
        eventTypes: ['core.company.created'],
      });

      answer = 500;
      await call(owner, 'POST', '/companies', { primaryName: 'Failing' });
      await flush();

      let log = await call(owner, 'GET', `/webhooks/${created.body.webhook.id}/deliveries`);

      expect(log.body.data[0]).toMatchObject({
        status: 'pending',
        responseStatus: 500,
        attempts: 1,
        error: 'HTTP 500',
      });
      expect(new Date(log.body.data[0].nextAttemptAt).getTime()).toBeGreaterThan(
        Date.now() + 30_000,
      );

      // The endpoint is back; the retry comes due.
      answer = 200;

      const { adminDb } = await import('./db');
      const { sql } = await import('drizzle-orm');

      await adminDb().execute(
        sql`update core_jobs set run_at = now() where queue = 'webhook.deliver'`,
      );
      await flush();

      log = await call(owner, 'GET', `/webhooks/${created.body.webhook.id}/deliveries`);
      expect(log.body.data[0]).toMatchObject({ status: 'succeeded', attempts: 2 });

      // Sent again by hand, and a test event.
      expect(
        (await call(owner, 'POST', `/webhooks/deliveries/${log.body.data[0].id}/redeliver`)).status,
      ).toBe(200);
      expect((await call(owner, 'POST', `/webhooks/${created.body.webhook.id}/test`)).status).toBe(
        200,
      );
      await flush();
      expect(received.some((entry) => JSON.parse(entry.body).type === 'core.webhook.test')).toBe(
        true,
      );
    },
  );

  it('refuses private addresses outside development, and lists event types to subscribe to', async () => {
    const { isPrivateAddress } = await import('~/lib/outbound');

    for (const address of [
      '127.0.0.1',
      '10.1.2.3',
      '169.254.169.254',
      '192.168.0.1',
      '::1',
      'fd00::1',
      '::ffff:10.0.0.1',
    ]) {
      expect({ address, private: isPrivateAddress(address) }).toEqual({ address, private: true });
    }

    expect(isPrivateAddress('93.184.216.34')).toBe(false);

    const { config } = await import('~/config');

    config.outbound.allowPrivate = false;

    try {
      expect(
        (await call(owner, 'POST', '/webhooks', { url: 'http://example.com/x', eventTypes: ['*'] }))
          .body.code,
      ).toBe('INVALID_URL');
      expect(
        (await call(owner, 'POST', '/webhooks', { url: 'https://10.0.0.5/x', eventTypes: ['*'] }))
          .body.code,
      ).toBe('INVALID_URL');
    } finally {
      config.outbound.allowPrivate = true;
    }

    const types = await call(memberToken, 'GET', '/events/types');

    expect(types.body.data.map((item: { type: string }) => item.type)).toContain(
      'core.customer.created',
    );
  });
});
