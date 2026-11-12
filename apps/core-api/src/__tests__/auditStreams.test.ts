import { createHmac } from 'node:crypto';
import { once } from 'node:events';
import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { loggedEmails } from '~/modules/email/email';
import { describeWithDb, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** A batch in the erxes format. */
const Batch = z.object({
  entries: z.array(
    z.object({
      seq: z.number(),
      hash: z.string(),
      prevHash: z.string().nullable(),
      action: z.string(),
    }),
  ),
});

const Signature = z.tuple([z.string(), z.string(), z.string()]);

describeWithDb('audit streaming', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let receiver: Server;
  let receiverUrl = '';
  let receiverStatus = 200;
  const received: { body: string; headers: IncomingHttpHeaders }[] = [];
  const entries = () => received.flatMap((item) => Batch.parse(JSON.parse(item.body)).entries);
  const stream = async () => (await t.owner().audit.streams({})).data[0];

  beforeAll(async () => {
    receiver = createServer((req, res) => {
      let body = '';

      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        if (receiverStatus === 200) received.push({ body, headers: req.headers });
        res.writeHead(receiverStatus).end();
      });
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

  /** Pauses and resumes the stream, which wakes its loop now instead of at its next round. */
  const wake = async (id: string) => {
    await t.owner().audit.updateStream({ id, status: 'paused' });
    await t.owner().audit.updateStream({ id, status: 'active' });
    await settle();
  };

  it('streams the whole chain in order, signed, resuming after the endpoint fails', async () => {
    // Something already in the log, to stream from the beginning.
    await t.owner().roles.create({ name: 'Support', permissions: ['contacts.view'] });

    const created = await t.owner().audit.createStream({
      name: 'SIEM',
      url: receiverUrl,
      authHeader: { name: 'DD-API-KEY', value: 'k-123' },
      from: 'beginning',
    });

    const { id } = created.stream;

    expect(created.secret).toMatch(/^whsec_/);
    expect(created.stream).toMatchObject({ authHeaderName: 'DD-API-KEY', status: 'active' });

    await settle();

    const first = entries();

    // Contiguous from 1, and each entry continues the previous one's hash.
    expect(first.map((entry) => entry.seq)).toEqual(first.map((_, index) => index + 1));
    expect(first.slice(1).map((entry) => entry.prevHash)).toEqual(
      first.slice(0, -1).map((entry) => entry.hash),
    );
    expect(first.map((entry) => entry.action)).toContain('role.created');

    // Signed like webhooks, with the service's own header.
    const [delivery] = received;

    const [, time, v1] = Signature.parse(
      /t=(\d+),v1=([0-9a-f]+)/.exec(String(delivery?.headers['erxes-signature']))?.slice(0, 3),
    );

    expect(
      createHmac('sha256', created.secret).update(`${time}.${delivery?.body}`).digest('hex'),
    ).toBe(v1);
    expect(delivery?.headers['dd-api-key']).toBe('k-123');

    // The endpoint goes down: nothing moves, the failure shows.
    const before = await stream();

    receiverStatus = 503;
    await t.owner().roles.create({ name: 'Sales', permissions: ['contacts.view'] });
    await wake(id);

    const down = await stream();

    expect(down?.cursorSeq).toBe(before?.cursorSeq);
    expect(down).toMatchObject({ lastError: 'HTTP 503' });
    expect(down?.consecutiveFailures).toBeGreaterThan(0);
    expect(down?.pending).toBeGreaterThan(0);

    // Back up: everything waiting arrives, still contiguous.
    receiverStatus = 200;
    await wake(id);

    const all = entries();

    expect(all.map((entry) => entry.seq)).toEqual(all.map((_, index) => index + 1));
    expect(all.map((entry) => entry.action)).toContain('audit.stream_paused');
    expect(await stream()).toMatchObject({ pending: 0, consecutiveFailures: 0, lastError: null });

    // A test entry goes out without moving anything.
    expect(await t.owner().audit.testStream({ id })).toMatchObject({ ok: true, status: 200 });

    // The owner did it: told by email, not in their own inbox.
    expect((await t.owner().notifications.list({ kind: 'core.security.' })).data).toEqual([]);
    expect(
      loggedEmails.some(
        (email) =>
          email.to === 'owner@acme.mn' &&
          email.subject.includes('Audit log streaming to SIEM was created'),
      ),
    ).toBe(true);
  });
});
