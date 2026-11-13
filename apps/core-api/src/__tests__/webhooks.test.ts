import { sql } from 'drizzle-orm';
import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { hmacSha256 } from '~/lib/crypto';
import { isPrivateAddress } from '~/lib/outbound';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** What a webhook endpoint receives. */
const Delivered = z.object({ type: z.string(), data: z.record(z.string(), z.unknown()) });

const Signature = z.tuple([z.string(), z.string(), z.string()]);

describe('webhooks', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let receiver: Server;
  let hookUrl = '';
  let answer = 200;
  const received: { signature: string; body: string; type: string }[] = [];

  beforeAll(async () => {
    receiver = createServer((req, res) => {
      let body = '';

      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        received.push({
          signature: String(req.headers['erxes-signature']),
          body,
          type: Delivered.parse(JSON.parse(body)).type,
        });
        res.statusCode = answer;
        res.end(answer === 200 ? 'ok' : 'boom');
      });
    }).listen(0);
    await once(receiver, 'listening');

    const address = receiver.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    hookUrl = `http://127.0.0.1:${address.port}/hook`;
  });

  afterAll(() => new Promise<void>((resolve) => receiver.close(() => resolve())));

  it(
    'delivers subscribed events, signed with the endpoint secret',
    { timeout: 180_000 },
    async () => {
      const subscription = { url: hookUrl, eventTypes: ['core.customer.*'] };

      await expect(t.member().webhooks.create(subscription)).rejects.toMatchObject({ status: 403 });

      const created = await t.owner().webhooks.create(subscription);

      expect(created.secret).toMatch(/^whsec_/);

      await t.owner().customers.create({ firstName: 'Hooked', primaryEmail: 'hooked@mail.mn' });
      await t.owner().companies.create({ primaryName: 'Not subscribed' });
      await settle();

      const deliveries = received.filter((entry) => entry.type.startsWith('core.'));

      expect(deliveries.map((entry) => entry.type)).toEqual(['core.customer.created']);

      const [first] = deliveries;

      const [, time, v1] = Signature.parse(
        /^t=(\d+),v1=([a-f0-9]{64})$/.exec(first?.signature ?? '')?.slice(0, 3),
      );

      expect(hmacSha256(created.secret, `${time}.${first?.body}`, 'hex')).toBe(v1);
      expect(Delivered.parse(JSON.parse(first?.body ?? '{}')).data).toMatchObject({
        type: 'core.customer.created',
        subject: { type: 'customer' },
      });

      const log = await t.owner().webhooks.deliveries({ id: created.webhook.id });

      expect(log.data[0]).toMatchObject({ status: 'succeeded', responseStatus: 200, attempts: 1 });
    },
  );

  it(
    'retries a failing endpoint with backoff and keeps every attempt in the log',
    { timeout: 240_000 },
    async () => {
      const created = await t
        .owner()
        .webhooks.create({ url: hookUrl, eventTypes: ['core.company.created'] });

      const log = async () =>
        (await t.owner().webhooks.deliveries({ id: created.webhook.id })).data;

      answer = 500;
      await t.owner().companies.create({ primaryName: 'Failing' });
      await settle();

      const [failed] = await log();

      expect(failed).toMatchObject({
        status: 'pending',
        responseStatus: 500,
        attempts: 1,
        error: 'HTTP 500',
      });
      expect(new Date(failed?.nextAttemptAt ?? 0).getTime()).toBeGreaterThan(Date.now() + 30_000);

      // The endpoint is back; the retry comes due.
      answer = 200;
      await adminDb().execute(
        sql`update core_jobs set run_at = now() where queue = 'webhook.deliver'`,
      );
      await settle();

      const [retried] = await log();

      expect(retried).toMatchObject({ status: 'succeeded', attempts: 2 });

      // Sent again by hand, and a test event.
      await t.owner().webhooks.redeliver({ deliveryId: retried?.id ?? '' });
      await t.owner().webhooks.test({ id: created.webhook.id });
      await settle();
      expect(received.map((entry) => entry.type)).toContain('core.webhook.test');
    },
  );

  it('refuses private addresses outside development, and lists event types to subscribe to', async () => {
    for (const address of [
      '127.0.0.1',
      '10.1.2.3',
      '169.254.169.254',
      '192.168.0.1',
      '::1',
      'fd00::1',
      '::ffff:10.0.0.1',
      // IPv6 forms that carry an IPv4 address: NAT64 and 6to4 of 10.0.0.1.
      '64:ff9b::a00:1',
      '2002:a00:1::',
    ])
      expect({ address, private: isPrivateAddress(address) }).toEqual({ address, private: true });

    expect(isPrivateAddress('93.184.216.34')).toBe(false);

    config.outbound.allowPrivate = false;

    try {
      for (const url of ['http://example.com/x', 'https://10.0.0.5/x'])
        await expect(t.owner().webhooks.create({ url, eventTypes: ['*'] })).rejects.toMatchObject({
          code: 'INVALID_URL',
        });
    } finally {
      config.outbound.allowPrivate = true;
    }

    const types = await t.member().webhooks.eventTypes({});

    expect(types.data.map((item) => item.type)).toContain('core.customer.created');
  });
});
