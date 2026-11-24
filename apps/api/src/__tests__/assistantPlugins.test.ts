import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { callsTo, chat, resultsOf, userMessage } from './assistantChat';
import { useTestDatabase } from './db';
import { inSteps, lastToolResult, systemOf } from './fakeModel';
import { type HrAssistant, hrAssistant, SKILL_TEXT } from './pluginRest';
import { type CoreClient, useTwoOrgs } from './support';

const KEY = 'fake-kimi-key-for-tests-0010';

const AGENT_INSTRUCTIONS = 'You answer questions about leave for the HR team.';

describe('assistant plugin contributions', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let model: HrAssistant['model'];
  let hr: HrAssistant['hr'];

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
    ({ model, hr } = await hrAssistant(t, KEY));
  });

  afterAll(() => Promise.all([model.close(), hr.close()]));

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
});
