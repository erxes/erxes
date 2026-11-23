import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { useTestDatabase } from './db';
import { connectProvider, fakeModel, lastToolResult, type Script } from './fakeModel';
import { chat, resultsOf, textOf, userMessage } from './assistantChat';
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

const block = (root: string) => `<a2ui>\nsurface("totals")\nroot = ${root}\n</a2ui>`;

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
    await connectProvider(t.owner(), KEY);
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

  it('tells the model which button the member pressed and what they entered', async () => {
    model.script(() => ({ text: 'Created.' }));

    await chat(t.owner(), {
      model: 'kimi-k3',
      message: {
        parts: [
          { type: 'text', text: 'Create task' },
          {
            type: 'data-action',
            data: { surfaceId: 'new-task', name: 'create_task', context: { priority: ['urgent'] } },
          },
        ],
      },
    });

    const sent = JSON.stringify(model.chats().at(-1)?.messages.at(-1)?.content);

    expect(sent).toContain('Create task');
    expect(sent).toContain('[UI action]');
    expect(sent).toContain(
      JSON.stringify(
        JSON.stringify({ event: 'create_task', context: { priority: ['urgent'] } }),
      ).slice(1, -1),
    );
  });

  it('asks the model once to fix an interface block the panel cannot draw', async () => {
    model.script((request) => ({
      text: JSON.stringify(request.messages.at(-1)?.content).includes('[UI check]')
        ? block('Stat("Orders", "312")')
        : `Here you go.\n\n${block('Gauge("Orders", "312")')}`,
    }));

    const before = model.chats().length;
    const { view } = await ask('How many orders?');

    expect(model.chats().length - before).toBe(2);
    expect(JSON.stringify(model.chats().at(-1)?.messages.at(-1)?.content)).toContain(
      "Component 'Gauge' is not defined in the catalog",
    );
    expect(textOf(view)).toContain('Stat("Orders", "312")');
  });

  it('stops asking when the fix cannot be drawn either', async () => {
    model.script(() => ({ text: block('Gauge("Orders", "312")') }));

    const before = model.chats().length;

    await ask('How many orders?');

    expect(model.chats().length - before).toBe(2);
  });
});
