import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { fakeModel, lastToolResult, type Script } from './fakeModel';
import { callsTo, chat, resultsOf, textOf, userMessage } from './assistantChat';
import { type CoreClient, useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0003';

const callThen =
  (procedure: string, input: Record<string, unknown>): Script =>
  (request) =>
    lastToolResult(request) === null
      ? { tool: 'callApi', input: { procedure, input } }
      : { text: 'Done.' };

const searchThen: Script = (request) =>
  lastToolResult(request) === null
    ? { tool: 'searchApi', input: { query: 'audit log' } }
    : { text: 'Found.' };

describe('assistant tools', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;

  const ask = (text: string, api: CoreClient = t.owner(), threadId?: string) =>
    chat(api, { threadId, message: userMessage(text), model: 'kimi-k3' });

  const tagNames = async () =>
    (await t.owner().tags.list({ type: 'customer' })).data.map((tag) => tag.name);

  beforeAll(async () => {
    model = await fakeModel(KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await t.owner().assistant.saveConnection({ provider: 'kimi', apiKey: KEY });
  });

  afterAll(() => model.close());

  it('runs reads at once and feeds the result back to the model', async () => {
    await t.owner().tags.create({ type: 'customer', name: 'Wholesale' });
    model.script(callThen('tags.list', { type: 'customer' }));

    const { view } = await ask('Which tags do we have?');

    expect(resultsOf(view, 'callApi')).toEqual([expect.objectContaining({ ok: true })]);
    expect(textOf(view)).toBe('Done.');
    expect(model.lastToolResult()).toContain('Wholesale');
  });

  it('runs a write as the member and tells the model it changed data', async () => {
    model.script(callThen('tags.create', { type: 'customer', name: 'VIP' }));

    const { view } = await ask('Add a VIP tag');

    expect(await tagNames()).toContain('VIP');
    expect(resultsOf(view, 'callApi')).toEqual([
      expect.objectContaining({ ok: true, changed: true }),
    ]);
  });

  it('refuses operations on the deny list', async () => {
    model.script(
      callThen('users.setPassword', { id: t.ids.member, password: 'Another-password-1234' }),
    );

    const { view } = await ask("Reset the member's password");

    expect(JSON.stringify(resultsOf(view, 'callApi'))).toContain('ASSISTANT_DENIED');
    expect(model.lastToolResult()).toContain('ASSISTANT_DENIED');
  });

  it("writes a custom integration's program but never its key or its hosts", async () => {
    const integration = await t.owner().integrations.create({
      key: 'boat',
      name: 'Boat',
      hosts: ['api.boat.test'],
    });

    model.script(
      callThen('integrations.setSecrets', { id: integration.id, secrets: { apiKey: 'sk_1234' } }),
    );
    await ask('Save the Boat key sk_1234');
    expect(model.lastToolResult()).toContain('ASSISTANT_DENIED');

    model.script(callThen('integrations.update', { id: integration.id, hosts: ['evil.test'] }));
    await ask('Let Boat call evil.test');
    expect(model.lastToolResult()).toContain('ASSISTANT_DENIED');

    model.script(
      callThen('integrations.saveProgram', {
        integrationId: integration.id,
        kind: 'action',
        key: 'ping',
        label: 'Ping Boat',
        code: 'return { pong: true };',
      }),
    );
    await ask('Add a ping action to Boat');

    const detail = await t.owner().integrations.get({ id: integration.id });

    expect(detail).toMatchObject({
      hosts: ['api.boat.test'],
      sealedNames: [],
      programs: [expect.objectContaining({ key: 'ping', version: 1 })],
    });

    model.script(callThen('integrations.testProgram', { id: detail.programs[0]?.id }));
    await ask('Ping Boat now');
    expect(model.lastToolResult()).toContain('"pong":true');
  });

  it("refuses what the member's role can't do, and doesn't offer it", async () => {
    model.script(callThen('audit.list', {}));
    await ask('Show the audit log', t.member());

    expect(model.lastToolResult()).toContain('NOT_ALLOWED');

    model.script(searchThen);
    await ask('Find audit', t.member());
    expect(model.lastToolResult()).not.toContain('audit.list');

    await ask('Find audit');
    expect(model.lastToolResult()).toContain('audit.list');
  });

  it('finds a procedure by the plural the member uses, like companies', async () => {
    model.script((request) =>
      lastToolResult(request) === null
        ? { tool: 'searchApi', input: { query: 'list companies', limit: 3 } }
        : { text: 'Found.' },
    );

    await ask('Which companies do we have?');

    expect(model.lastToolResult()).toContain('"procedure":"companies.list"');
  });

  it("asks the member a question, ends the run, and carries on with the member's answer", async () => {
    model.script((request) =>
      lastToolResult(request) === null
        ? { tool: 'ask_user', input: { questions: [{ question: 'Which period?' }] } }
        : { text: 'Thanks.' },
    );

    const before = model.chats().length;
    const { threadId, view } = await ask('Make a report');

    expect(callsTo(view, 'ask_user')).toEqual([{ questions: [{ question: 'Which period?' }] }]);
    expect(resultsOf(view, 'ask_user')).toEqual([{ asked: true }]);
    expect(model.chats().length - before).toBe(1);

    model.script(() => ({ text: 'Here is last month.' }));

    const answered = await ask('Last month', t.owner(), threadId);

    expect(textOf(answered.view)).toBe('Here is last month.');
    expect(model.chats().at(-1)?.messages.at(-1)).toMatchObject({
      role: 'user',
      content: [{ type: 'text', text: 'Last month' }],
    });
  });
});
