import { once } from 'node:events';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { hmacSha256Bytes } from '~/lib/crypto';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

const API_KEY = 'sk_live_dock_0123456789';

const QUOTED = 'q"uo\\ted_0123';

interface Seen {
  method: string;
  path: string;
  type: string;
  body: string;
}

describe('custom integration doors', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const seen: Seen[] = [];
  let service: Server;
  let host = '';
  let integrationId = '';

  const save = (
    key: string,
    code: string,
    extra: {
      kind?: 'action' | 'incoming';
      outputs?: { key: string; label: string; type: 'number' }[];
    } = {},
  ) =>
    t.owner().integrations.saveProgram({
      integrationId,
      kind: extra.kind ?? 'action',
      key,
      label: `Dock ${key}`,
      outputs: extra.outputs,
      code,
    });

  const run = async (key: string, code: string) =>
    t.owner().integrations.testProgram({ id: (await save(key, code)).id });

  const callsTo = (path: string) => seen.filter((call) => call.path.startsWith(path));

  beforeAll(async () => {
    service = createServer((req, res) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        seen.push({
          method: req.method ?? '',
          path: req.url ?? '',
          type: req.headers['content-type'] ?? '',
          body: Buffer.concat(chunks).toString('utf8'),
        });
        res.setHeader('content-type', 'text/plain');
        res.setHeader('x-echo', req.headers.authorization ?? '');
        res.end('done');
      });
    }).listen(0, '127.0.0.1');
    await once(service, 'listening');

    const address = service.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    host = `127.0.0.1:${address.port}`;
    integrationId = (
      await t.owner().integrations.create({ key: 'dock', name: 'Dock', hosts: [host] })
    ).id;
    await t.owner().integrations.setSecrets({
      id: integrationId,
      secrets: { apiKey: API_KEY, quoted: QUOTED },
    });
  });

  afterAll(() => new Promise<void>((resolve) => service.close(() => resolve())));

  it('fills a sealed value into a query and a text body, and sends text as text', async () => {
    const result = await run(
      'text',
      `const res = await request({
        method: 'put',
        url: 'http://${host}/text',
        query: { token: '{{secret.apiKey}}', page: 2 },
        body: 'raw {{secret.apiKey}}',
      });
      return { status: res.status, body: res.body };`,
    );

    expect(result).toMatchObject({ ok: true, result: { status: 200, body: 'done' } });
    expect(callsTo('/text')).toEqual([
      { method: 'PUT', path: `/text?token=${API_KEY}&page=2`, type: '', body: `raw ${API_KEY}` },
    ]);
  });

  it('keeps a JSON body valid when a sealed value holds a quote', async () => {
    await run(
      'json',
      `await request({ method: 'POST', url: 'http://${host}/json', body: { k: '{{secret.quoted}}' } });
      return {};`,
    );

    expect(callsTo('/json')).toEqual([
      {
        method: 'POST',
        path: '/json',
        type: 'application/json',
        body: JSON.stringify({ k: QUOTED }),
      },
    ]);
  });

  it('hides a sealed value the service sends back in a header', async () => {
    const result = await run(
      'echo',
      `const res = await request({
        url: 'http://${host}/echo',
        headers: { Authorization: 'Bearer {{secret.apiKey}}' },
      });
      return { echoed: res.headers['x-echo'] };`,
    );

    expect(result).toMatchObject({ ok: true, result: { echoed: 'Bearer [sealed]' } });
    expect(callsTo('/echo')).toHaveLength(1);
  });

  it('names the sealed value a program asks for and the integration lacks', async () => {
    const result = await run(
      'missing',
      `return request({ url: 'http://${host}/missing', headers: { 'X-Key': '{{secret.nope}}' } });`,
    );

    expect(JSON.stringify(result)).toContain('Dock has no sealed value nope');
    expect(callsTo('/missing')).toEqual([]);
  });

  it('refuses options it does not know, and a path goes to the first host over https', async () => {
    const traced = await run(
      'trace',
      `return request({ method: 'TRACE', url: 'http://${host}/trace' });`,
    );

    const secure = await run('secure', `return request({ url: '/secure' });`);

    expect(traced.ok).toBe(false);
    expect(callsTo('/trace')).toEqual([]);
    expect(JSON.stringify(secure)).toContain('The request failed');
    expect(callsTo('/secure')).toEqual([]);
  });

  it('refuses a program that returns too much', async () => {
    expect(await run('large', `return 'x'.repeat(30000);`)).toMatchObject({
      ok: false,
      code: 'OUTPUT_TOO_LARGE',
    });
  });

  it('checks a shared token and a base64 signature without handing the program the value', async () => {
    const token = await save(
      'token',
      `return { same: await equals(incoming.headers['x-token'] ?? '', 'apiKey') };`,
      { kind: 'incoming' },
    );

    const signed = await save(
      'signed',
      `return { valid: await verify(incoming.headers['x-sig'] ?? '', incoming.rawBody, 'apiKey', 'base64') };`,
      { kind: 'incoming' },
    );

    const rawBody = '{"id":1}';
    const signature = hmacSha256Bytes(API_KEY, rawBody).toString('base64');
    const other = hmacSha256Bytes(API_KEY, `${rawBody} `).toString('base64');

    const test = (id: string, headers: Record<string, string>) =>
      t.owner().integrations.testProgram({ id, incoming: { headers, rawBody } });

    expect(await test(token.id, { 'x-token': API_KEY })).toMatchObject({ result: { same: true } });
    expect(await test(token.id, { 'x-token': 'guess' })).toMatchObject({ result: { same: false } });
    expect(await test(signed.id, { 'x-sig': signature })).toMatchObject({
      result: { valid: true },
    });
    expect(await test(signed.id, { 'x-sig': other })).toMatchObject({
      result: { valid: false },
    });
  });

  it('corrects a yes or no and a list, and leaves the outputs alone when the answer is no record', async () => {
    const outputsOf = async (key: string) =>
      (await t.owner().automations.catalog({})).actions.find(
        (action) => action.type === `integrations.dock.${key}`,
      )?.outputs;

    const declared = [{ key: 'active', label: 'Active', type: 'number' as const }];

    const record = await save('record', 'return { active: true, tags: ["a"] };', {
      outputs: declared,
    });

    const list = await save('list', 'return [1, 2];', { outputs: declared });

    await t.owner().integrations.testProgram({ id: record.id });
    await t.owner().integrations.testProgram({ id: list.id });

    expect(await outputsOf('record')).toEqual([
      { key: 'active', label: 'Active', type: 'text' },
      { key: 'tags', label: 'Tags', type: 'list' },
    ]);
    expect(await outputsOf('list')).toEqual(declared);
  });

  it('publishes nothing for an event whose key is not a key, and answers 404 once a program is gone', async () => {
    const program = await save(
      'badkey',
      'return { event: "Boat-Sunk", payload: { id: incoming.body.id } };',
      { kind: 'incoming' },
    );

    const path = new URL(program.address ?? '').pathname;
    const call = () => fetch(t.url(path), { method: 'POST', body: '{"id":1}' });

    expect((await call()).status).toBe(200);
    await settle();
    expect(
      (await t.owner().automations.catalog({})).triggers.filter((trigger) =>
        trigger.type.startsWith('integrations.dock.'),
      ),
    ).toEqual([]);

    await t.owner().integrations.removeProgram({ id: program.id });
    expect((await call()).status).toBe(404);
  });

  it('renames, changes hosts, and deletes a program and then the integration', async () => {
    const program = await save('gone', 'return {};');

    expect(
      await t.owner().integrations.update({
        id: integrationId,
        name: 'Dockyard',
        hosts: [host, 'api.dock.test'],
      }),
    ).toMatchObject({ name: 'Dockyard', hosts: [host, 'api.dock.test'] });
    await expect(
      t.owner().integrations.restoreProgram({ id: program.id, version: 9 }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(
      t.owner().integrations.saveProgram({
        integrationId: 'nope',
        kind: 'action',
        key: 'x',
        label: 'X',
        code: 'return {};',
      }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    await t.owner().integrations.removeProgram({ id: program.id });

    const { actions } = await t.owner().automations.catalog({});

    expect(actions.some((action) => action.type === 'integrations.dock.gone')).toBe(false);
    expect(actions.find((action) => action.type === 'integrations.dock.text')?.source).toBe(
      'Dockyard',
    );

    await t.owner().integrations.remove({ id: integrationId });
    await expect(t.owner().integrations.get({ id: integrationId })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    expect((await t.owner().integrations.list({})).data).toEqual([]);
    expect(
      (await t.owner().automations.catalog({})).actions.filter((action) =>
        action.type.startsWith('integrations.'),
      ),
    ).toEqual([]);
  });
});
