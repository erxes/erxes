import { createServer, type IncomingHttpHeaders, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { makeDue, settle } from './settle';

interface Received {
  path: string;
  headers: IncomingHttpHeaders;
  body: unknown;
}

/** The step that posts to another system, as a run uses it. */
describe('automation webhooks', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const { onlyRun, outputsOf } = t;
  let receiver: Server;
  let hookUrl = '';
  const received: Received[] = [];

  beforeAll(async () => {
    receiver = createServer((req, res) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const path = req.url ?? '';

        received.push({
          path,
          headers: req.headers,
          body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
        });

        if (path.endsWith('/text')) {
          res.setHeader('content-type', 'text/plain');
          res.end('thanks');

          return;
        }

        res.statusCode = path.endsWith('/moved') ? 300 : 200;
        res.setHeader('content-type', 'application/json');
        res.end('{"ok":true}');
      });
    }).listen(0);

    const address = receiver.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    hookUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(() => new Promise<void>((resolve) => receiver.close(() => resolve())));

  it('posts the event and record as JSON with the member’s plain headers, and keeps the answer', async () => {
    const id = await t.active(
      'Hooks',
      forCustomer('Hooked', [
        action('plain', 'core.webhook.post', {
          url: `${hookUrl}/json`,
          headers: {
            'X-Trace': 'abc',
            'X-Empty': null,
            'X-Count': 5,
            'X-Long': 'L'.repeat(2500),
            'X-Host': 'kept',
            Hostname: 'kept',
            Host: 'evil.example',
            X_Under: 'dropped',
            [`X-${'a'.repeat(59)}`]: 'dropped',
            'Content-Type': 'text/plain',
            'User-Agent': 'spoof',
          },
        }),
        action('custom', 'core.webhook.post', {
          url: `${hookUrl}/text`,
          body: { hello: '{{subject.firstName}}' },
        }),
        action('after', 'core.note.add', {
          body: '{{subject.firstName}} got {{steps.plain.output.status}} then {{steps.custom.output.body}}',
        }),
      ]),
    );

    const customer = await t.owner().customers.create({ firstName: 'Hooked' });

    await settle();

    const { run, steps } = await onlyRun(id);

    expect(run.status).toBe('succeeded');
    expect(await outputsOf(id)).toMatchObject({
      plain: { status: 200, body: { ok: true } },
      custom: { status: 200, body: 'thanks' },
    });
    expect(steps.find((step) => step.stepId === 'after')?.input).toEqual({
      body: 'Hooked got 200 then thanks',
    });

    const plain = received.find((item) => item.path === '/json');

    expect(plain?.headers).toMatchObject({
      'x-trace': 'abc',
      'x-empty': '',
      'x-count': '5',
      'x-long': 'L'.repeat(2000),
      'x-host': 'kept',
      hostname: 'kept',
      'content-type': 'application/json',
      'user-agent': 'erxes-automations/1',
      'idempotency-key': `${run.id}:plain`,
    });
    expect(plain?.headers.host).not.toBe('evil.example');
    expect(
      Object.keys(plain?.headers ?? {}).filter((key) => key.includes('_') || key.length > 60),
    ).toEqual([]);
    expect(plain?.body).toMatchObject({
      event: { type: 'core.customer.created' },
      subject: { id: customer.id, firstName: 'Hooked' },
      automation: { id, name: 'Hooks' },
      run: run.id,
    });
    expect(received.find((item) => item.path === '/text')?.body).toEqual({ hello: 'Hooked' });

    const { actions } = await t.owner().automations.catalog({});

    expect(actions.find((item) => item.type === 'core.webhook.post')?.outputs).toEqual([
      { key: 'status', label: 'Response status', type: 'number' },
      { key: 'body', label: 'Response', type: 'text' },
    ]);
  });

  it('retries an address that answers 300, as it is not a success', async () => {
    const id = await t.active(
      'Moved',
      forCustomer('Moved', [action('post', 'core.webhook.post', { url: `${hookUrl}/moved` })]),
    );

    await t.owner().customers.create({ firstName: 'Moved' });
    await settle();

    expect((await t.runsOf(id))[0]?.status).toBe('running');

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    const [run] = await t.runsOf(id);

    expect(run?.status).toBe('failed');
    expect(run?.error).toContain('HTTP 300');
  });

  it('saves a webhook sample and exposes its fields while off before switching triggers is saved, and still refuses active non-webhook automations', async () => {
    const draft = await t.owner().automations.create({
      name: 'Draft hook sample',
      definition: forCustomer('Sampled', [action('note', 'core.note.add', { body: 'hi' })]),
    });

    const hookPath = new URL(draft.hookUrl).pathname;

    const sampleResponse = await fetch(t.url(`${hookPath}?source=shop`), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId: 'ord_1' }),
    });

    expect(sampleResponse.status).toBe(202);
    expect(await sampleResponse.json()).toEqual({ ok: true, started: false, sample: true });

    const reloaded = await t.owner().automations.get({ id: draft.id });

    expect(reloaded.hookSample).toMatchObject({
      body: { orderId: 'ord_1' },
      query: { source: 'shop' },
    });

    const ownFields = (await t.owner().automations.fields({ automation: draft.id })).data.map(
      (field) => field.path,
    );

    expect(ownFields).toContain('event.payload.body.orderId');
    expect(ownFields).toContain('event.payload.query.source');

    const otherFields = (await t.other().automations.fields({ automation: draft.id })).data.map(
      (field) => field.path,
    );

    expect(otherFields).not.toContain('event.payload.body.orderId');

    await t.owner().automations.activate({ id: draft.id });

    const activeResponse = await fetch(t.url(hookPath), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ orderId: 'ord_2' }),
    });

    expect(activeResponse.status).toBe(404);
  });
});
