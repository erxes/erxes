import { events } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { adminDb, useTestDatabase } from './db';
import { inSteps, lastToolResult, systemOf } from './fakeModel';
import { type HrAssistant, hrAssistant } from './pluginRest';
import { useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0011';

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

describe('agents that plugins send their conversations to', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: HrAssistant['model'];
  let hr: HrAssistant['hr'];

  beforeAll(async () => {
    ({ model, hr } = await hrAssistant(t, KEY));
  });

  afterAll(() => Promise.all([model.close(), hr.close()]));

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
