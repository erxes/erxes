import { events } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { callsTo, chat, resultsOf, userMessage } from './assistantChat';
import { adminDb, useTestDatabase } from './db';
import { connectProvider, fakeModel, inSteps, lastToolResult, systemOf } from './fakeModel';
import { hrManifest, pluginRest, SKILL_TEXT } from './pluginRest';
import { type CoreClient, useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0010';

const AGENT_INSTRUCTIONS = 'You answer questions about leave for the HR team.';
const LEAVE_URL = 'https://hr.example.com/leave/new';

/** The run events of one conversation, by type. */
const eventsOf = async (type: string, key: string) =>
  (await adminDb().select().from(events).where(eq(events.type, type))).filter((event) =>
    JSON.stringify(event.payload).includes(`"key":"${key}"`),
  );

/** The payloads of the conversation's `type` events, once there are `count` of them. */
const settledEvents = async (type: string, key: string, count = 1) => {
  await expect
    .poll(async () => (await eventsOf(type, key)).length, { timeout: 10_000 })
    .toBe(count);

  return (await eventsOf(type, key)).map((event) => event.payload);
};

describe('assistant plugin contributions', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: Awaited<ReturnType<typeof fakeModel>>;
  let hr: Awaited<ReturnType<typeof pluginRest>>;

  const ask = (text: string, api: CoreClient = t.owner()) =>
    chat(api, { model: 'kimi-k3', message: userMessage(text) });

  /** The procedures searchApi found, in its order, as the model's request `back` requests ago read them. */
  const searched = (back = 2) =>
    [
      ...(lastToolResult(model.chats().at(-back) ?? { model: '', messages: [] }) ?? '').matchAll(
        /"procedure":"([^"]+)"/g,
      ),
    ].map(([, name]) => name);

  beforeAll(async () => {
    model = await fakeModel(KEY);
    hr = await pluginRest(t.url(''));
    Object.assign(config.assistant.endpoints, { kimi: model.url });

    await t.client(await t.pluginToken()).plugins.registerManifest(hrManifest(hr.url));
    await t.other().plugins.uninstall({ name: 'hr' });

    await connectProvider(t.owner(), KEY);
    await connectProvider(t.other(), KEY);
  });

  afterAll(async () => {
    await model.close();
    await hr.close();
  });

  it('lists an installed plugin skill by name and loads its instructions only on demand', async () => {
    model.script(
      inSteps({ tool: 'loadSkill', input: { name: 'hr-leave-balances' } }, { text: 'Done.' }),
    );

    await ask('How many leave days are left?');

    const [first] = model.chats().slice(-2);
    const system = first ? systemOf(first) : '';

    expect(system).toContain('hr-leave-balances');
    expect(system).toContain('how many leave days employees have left');
    expect(system).not.toContain(SKILL_TEXT);
    expect(model.lastToolResult()).toContain('Read days left with hr:leave.balances');
    expect(model.lastToolResult()).toContain('take precedence');
  });

  it('offers no skill of a plugin the organisation has not installed', async () => {
    model.script(
      inSteps({ tool: 'loadSkill', input: { name: 'hr-leave-balances' } }, { text: 'Done.' }),
    );

    await ask('How many leave days are left?', t.other());

    const [first] = model.chats().slice(-2);

    expect(first ? systemOf(first) : '').not.toContain('hr-leave-balances');
    expect(model.lastToolResult()).toContain('UNKNOWN_SKILL');
  });

  it("finds a route in the plugin's member document and calls it with the member's session", async () => {
    model.script(
      inSteps(
        { tool: 'searchApi', input: { query: 'leave days left' } },
        {
          tool: 'callApi',
          input: { procedure: 'hr:leave.balances', input: { employee: 'Bat-Erdene' } },
        },
        { text: 'Bat-Erdene has 12 days.' },
      ),
    );

    const before = hr.calls.length;
    const { view } = await ask('How many leave days does Bat-Erdene have?');
    const request = model.chats().at(-2);
    const found = request ? lastToolResult(request) : '';

    expect(found).toContain('hr:leave.balances');
    expect(found).toContain('/v1/leave/balances');
    expect(found).toContain('employee');
    expect(hr.calls.slice(before)).toEqual([
      {
        procedure: 'leave.balances',
        userId: t.ids.owner,
        orgId: t.ids.org,
        input: { employee: 'Bat-Erdene' },
      },
    ]);
    expect(model.lastToolResult()).toContain('Bat-Erdene Ganbold');
    expect(resultsOf(view, 'callApi')).toEqual([expect.not.objectContaining({ changed: true })]);
  });

  it('offers no route of a plugin the organisation has not installed', async () => {
    model.script(
      inSteps(
        { tool: 'searchApi', input: { query: 'leave days left' } },
        { tool: 'callApi', input: { procedure: 'hr:leave.balances', input: {} } },
        { text: 'Nothing found.' },
      ),
    );

    const before = hr.calls.length;

    await ask('How many leave days are left?', t.other());

    expect(searched()).not.toContain('hr:leave.balances');
    expect(model.lastToolResult()).toContain('UNKNOWN_PROCEDURE');
    expect(hr.calls.length).toBe(before);
  });

  it('ranks the route whose whole name the query says above routes that share more words', async () => {
    model.script(
      inSteps({ tool: 'searchApi', input: { query: 'leave balances' } }, { text: 'Found it.' }),
    );

    await ask('Which route reads leave balances?');

    expect(searched(1).slice(0, 2)).toEqual(['hr:leave.balances', 'hr:leave.balances.export']);
  });

  it("hides a route from a member whose role lacks the permission the plugin's document names", async () => {
    model.script(
      inSteps(
        { tool: 'searchApi', input: { query: 'leave balances' } },
        { tool: 'callApi', input: { procedure: 'hr:leave.balances', input: {} } },
        { text: 'You cannot see that.' },
      ),
    );

    const before = hr.calls.length;

    await ask('Leave balances please', t.member());

    const found = searched();

    expect(found).toContain('hr:leave.balances.export');
    expect(found).not.toContain('hr:leave.balances');
    expect(model.lastToolResult()).toContain('FORBIDDEN');
    expect(hr.calls.length).toBe(before);
  });

  it("surfaces the plugin's own refusal to the model", async () => {
    model.script(
      inSteps(
        { tool: 'callApi', input: { procedure: 'hr:leave.approve', input: { requestId: 'r1' } } },
        { text: 'You cannot do that.' },
      ),
    );

    await ask('Approve leave request r1', t.member());

    expect(hr.calls.at(-1)).toMatchObject({ procedure: 'leave.approve', userId: t.ids.member });
    expect(model.lastToolResult()).toContain('FORBIDDEN');
    expect(model.lastToolResult()).toContain('hr.leave.view');
  });

  it('fills the path and body of a route that changes data and tells the model it did', async () => {
    model.script(
      inSteps(
        {
          tool: 'callApi',
          input: { procedure: 'hr:leave.approve', input: { requestId: 'r1', note: 'Enjoy' } },
        },
        { text: 'Approved.' },
      ),
    );

    const { view } = await ask('Approve leave request r1');

    expect(hr.calls.at(-1)).toEqual({
      procedure: 'leave.approve',
      userId: t.ids.owner,
      orgId: t.ids.org,
      input: { requestId: 'r1', note: 'Enjoy' },
    });
    expect(resultsOf(view, 'callApi')).toEqual([
      expect.objectContaining({ ok: true, changed: true }),
    ]);
  });

  it('refuses a path value that would reach another route', async () => {
    model.script(
      inSteps(
        { tool: 'callApi', input: { procedure: 'hr:leave.approve', input: { requestId: '..' } } },
        { text: 'That did not work.' },
      ),
    );

    const before = hr.calls.length;

    await ask('Approve leave request ..');

    expect(model.lastToolResult()).toContain('INVALID_INPUT');
    expect(hr.calls.length).toBe(before);
  });

  it("runs an agent an admin made by its key's rules, and its answer goes back to the plugin that sent the message", async () => {
    const agent = await t.owner().agents.create({
      name: 'Leave helper',
      instructions: AGENT_INSTRUCTIONS,
      access: { areas: {}, pluginAccess: { hr: 'read' } },
    });

    model.script(
      inSteps(
        { tool: 'searchApi', input: { query: 'leave balances' } },
        { tool: 'callApi', input: { procedure: 'hr:leave.balances', input: {} } },
        {
          tool: 'show',
          input: { blocks: [{ kind: 'link', title: 'Request leave', url: LEAVE_URL }] },
        },
        {
          tool: 'show',
          input: { blocks: [{ kind: 'link', title: 'Request leave', url: LEAVE_URL }] },
        },
        { text: 'Bat-Erdene has 12 days.' },
      ),
    );

    const before = hr.calls.length;

    await t.hr().agents.submit({ id: agent.id, key: 'chat-1', text: 'Leave for Bat-Erdene?' });

    expect(await settledEvents('core.agent.finished', 'chat-1')).toEqual([
      {
        agentId: agent.id,
        plugin: 'hr',
        key: 'chat-1',
        answer: 'Bat-Erdene has 12 days.',
        blocks: [{ kind: 'link', title: 'Request leave', url: LEAVE_URL }],
      },
    ]);
    expect(hr.calls.slice(before)).toEqual([
      { procedure: 'leave.balances', userId: t.ids.owner, orgId: t.ids.org, input: {} },
    ]);
    expect(systemOf(model.chats().at(-1) ?? { model: '', messages: [] })).toContain(
      AGENT_INSTRUCTIONS,
    );
    expect((await t.owner().apiKeys.list()).data.map((key) => key.id)).not.toContain(agent.keyId);
    await expect(
      t.hr().agents.submit({ id: 'no-such-agent', key: 'chat-1', text: 'Hello' }),
    ).rejects.toMatchObject({ status: 404 });
  });

  it("hides a route from an agent whose key's actions leave out the permission it names", async () => {
    const agent = await t.owner().agents.create({
      name: 'Approver',
      instructions: AGENT_INSTRUCTIONS,
      access: { areas: {}, pluginAccess: { hr: 'write' }, actions: { hr: ['hr.leave.approve'] } },
    });

    model.script(
      inSteps(
        { tool: 'searchApi', input: { query: 'leave balances' } },
        { tool: 'callApi', input: { procedure: 'hr:leave.balances', input: {} } },
        { text: 'I cannot read balances.' },
      ),
    );

    const before = hr.calls.length;

    await t.owner().agents.try({ id: agent.id, text: 'Leave balances?' });

    expect(searched()).not.toContain('hr:leave.balances');
    expect(model.lastToolResult()).toContain('FORBIDDEN');
    expect(hr.calls.length).toBe(before);
  });

  it('a PATCH of only instructions keeps the portal and provider', async () => {
    const portal = await t.owner().portals.create({ name: 'Leave desk' });

    const agent = await t.owner().agents.create({
      name: 'Desk',
      instructions: AGENT_INSTRUCTIONS,
      provider: 'kimi',
      portalId: portal.id,
      access: { areas: {}, pluginAccess: { hr: 'read' } },
    });

    expect(
      await t.owner().agents.update({ id: agent.id, instructions: 'Answer in one line.' }),
    ).toMatchObject({ instructions: 'Answer in one line.', provider: 'kimi', portalId: portal.id });

    expect(await t.owner().agents.update({ id: agent.id, portalId: null })).toMatchObject({
      instructions: 'Answer in one line.',
      provider: 'kimi',
      portalId: null,
    });
  });

  it('keeps a plugin route that takes a credential denied whatever a skill says', async () => {
    model.script(
      inSteps(
        { tool: 'loadSkill', input: { name: 'hr-payroll-setup' } },
        { tool: 'searchApi', input: { query: 'payroll connect' } },
        {
          tool: 'callApi',
          input: { procedure: 'hr:payroll.connect', input: { apiKey: 'payroll-key-0001' } },
        },
        { text: 'Done.' },
      ),
    );

    const before = hr.calls.length;
    const { view } = await ask('Connect payroll');

    expect(callsTo(view, 'callApi')).toHaveLength(1);
    expect(searched()).not.toContain('hr:payroll.connect');
    expect(model.lastToolResult()).toContain('"DENIED"');
    expect(hr.calls.length).toBe(before);
  });

  const leave = { areas: {}, pluginAccess: { hr: 'read' as const } };
  const approve = { tool: 'callApi', input: { procedure: 'hr:leave.approve', input: {} } };
  const chatAt = (index: number) => model.chats().at(index) ?? { model: '', messages: [] };
  const resultAt = (index: number) => lastToolResult(chatAt(index));

  it('hands a conversation to a person when a call is refused, and logs its calls for admins and the plugin', async () => {
    const { id } = await t
      .owner()
      .agents.create({ name: 'Desk', instructions: '.', access: leave });

    const line = 'Ажилтан удахгүй хариулна.';
    const handOff = { tool: 'handOff', input: { reason: 'Approving is refused', message: line } };

    model.script(inSteps(approve, handOff));
    await t.hr().agents.submit({ id, key: 'chat-2', text: 'Approve r1' });

    expect(await settledEvents('core.agent.handed_off', 'chat-2')).toEqual([
      { agentId: id, plugin: 'hr', key: 'chat-2', reason: 'Approving is refused' },
    ]);
    expect(await settledEvents('core.agent.finished', 'chat-2')).toEqual([
      expect.objectContaining({ answer: line }),
    ]);
    expect((await t.hr().agents.runs({ id, key: 'chat-2' })).data[0]?.runs).toEqual([
      expect.objectContaining({
        text: 'Approve r1',
        model: 'kimi-k3',
        status: 'done',
        handedOff: 'Approving is refused',
        calls: [
          expect.objectContaining({ procedure: 'hr:leave.approve', ok: false, code: 'FORBIDDEN' }),
        ],
      }),
    ]);
    expect(
      (await t.owner().agents.runs({ id })).data.map((conversation) => conversation.key),
    ).toEqual(['chat-2']);
    await expect(t.hr().agents.runs({ id, key: 'try-x' })).rejects.toMatchObject({ status: 404 });
    await t.hr().agents.restart({ id, key: 'chat-2' });
    expect((await t.hr().agents.runs({ id, key: 'chat-2' })).data[0]?.runs).toEqual([]);
  });

  it('hands off by itself after three failed calls, and refuses a fourth', async () => {
    const { id } = await t
      .owner()
      .agents.create({ name: 'Loop', instructions: '.', access: leave });

    model.script(inSteps(approve, approve, approve, approve, { text: 'A person will help.' }));
    await t.hr().agents.submit({ id, key: 'chat-3', text: 'Approve r1' });

    const [handedOff] = await settledEvents('core.agent.handed_off', 'chat-3');

    expect(JSON.stringify(handedOff)).toMatch(
      /"reason":"3 calls failed; the last: Your access does not include/,
    );
    expect(model.lastToolResult()).toContain('call handOff now');

    const calls = (await t.hr().agents.runs({ id, key: 'chat-3' })).data[0]?.runs[0]?.calls;

    expect(calls?.map((call) => call.code)).toEqual([
      'FORBIDDEN',
      'FORBIDDEN',
      'FORBIDDEN',
      'BLOCKED',
    ]);
  });

  it("offers a portal's guest routes with its token alone, and a customer's own with theirs", async () => {
    const portal = await t.owner().portals.create({ name: 'Felt', origins: ['https://felt.mn'] });

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Bat-Erdene', lastName: 'Dorj' });

    const search = { tool: 'searchApi', input: { query: 'products orders' } };
    const list = { tool: 'callApi', input: { procedure: 'hr:portal:products.list' } };

    await t.hr().portals.attach({ id: portal.id, recordId: 'felt-1' });

    const { id } = await t
      .owner()
      .agents.create({ name: 'Felt', instructions: '.', portalId: portal.id, access: leave });

    model.script(inSteps(search, list, { text: 'Felt boots.' }));
    await t.owner().agents.try({ id, text: 'What do you sell?', restart: true });

    expect(resultAt(-2)).toContain('hr:portal:products.list');
    expect(resultAt(-2)).not.toContain('me.orders');
    expect(hr.portalCalls).toEqual([
      { procedure: 'products.list', portalToken: true, customerToken: false },
    ]);

    model.script(inSteps(search, { text: 'Your orders.' }));
    await t.hr().agents.submit({ id, key: 'felt-1', customerId: customer.id, text: 'Orders?' });
    await settledEvents('core.agent.finished', 'felt-1');

    expect(resultAt(-1)).toContain('hr:portal:me.orders');
    expect(systemOf(chatAt(-1))).toContain(
      'The customer is Bat-Erdene Dorj. Phone: not known. Email: not known.',
    );
  });
});
