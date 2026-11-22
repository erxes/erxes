import type { AutomationStep } from '@erxes/core-contract';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase } from './db';
import { type ChatRequest, fakeModel, inSteps, lastToolResult } from './fakeModel';
import { settle } from './settle';
import { type CoreClient, useTestServer } from './support';

const MODEL_KEY = 'fake-kimi-key-for-agent-tools-01';

const toolNames = (request: ChatRequest | undefined) =>
  (request?.tools ?? []).map((tool) => tool.function.name);

/**
 * An agent step does anything a step can: it finds automation actions and runs them as a step
 * would, checked the same way, limited to the categories the step allows, on the step's model.
 */
describe('automation agent tools', { timeout: 120_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  let owner: CoreClient;
  let ownerId = '';
  let model: Awaited<ReturnType<typeof fakeModel>>;

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'o@acme.mn' },
    });

    ownerId = acme.owner.id;
    owner = server.client({ user: acme.owner.id, org: acme.organization.id });
    model = await fakeModel(MODEL_KEY);
    Object.assign(config.assistant.endpoints, { kimi: model.url });
    await owner.integrations.connect({ key: 'kimi', name: 'Kimi', keys: { apiKey: MODEL_KEY } });
  });

  afterAll(async () => {
    await model.close();
  });

  /** An automation whose only step asks the agent, started by a customer named `firstName`. */
  const askOnCustomer = async (firstName: string, input: Record<string, unknown>) => {
    const steps: AutomationStep[] = [
      { id: 'ask', type: 'action', action: 'core.agent.ask', input: { prompt: 'Go', ...input } },
    ];

    const automation = await owner.automations.create({
      name: `Agent for ${firstName}`,
      definition: {
        trigger: {
          kind: 'event',
          event: 'core.customer.created',
          conditions: {
            match: 'all',
            rules: [{ path: 'subject.firstName', op: 'eq', value: firstName }],
          },
        },
        steps,
      },
    });

    await owner.automations.activate({ id: automation.id });

    const customer = await owner.customers.create({ firstName });

    await settle();

    const [run] = (await owner.automations.runs({ id: automation.id })).data;

    if (!run) throw new Error('no run started');

    return { customer, ...(await owner.automations.run({ runId: run.id })) };
  };

  it('runs only the categories the step allows, checks input as a step, on the chosen model', async () => {
    const { data } = await owner.assistant.models({});
    const chosen = data.find((entry) => entry.provider === 'kimi')?.models.at(-1)?.id ?? '';

    model.script(
      inSteps(
        { tool: 'searchActions', input: { query: '' } },
        { tool: 'runAction', input: { action: 'core.note.add', input: {} } },
        {
          tool: 'runAction',
          input: { action: 'core.note.add', input: { body: 'Welcomed by the agent' } },
        },
        {
          tool: 'runAction',
          input: { action: 'core.notification.send', input: { title: 'Hi', userIds: [ownerId] } },
        },
        { text: 'Noted the welcome; notifying is not mine to do.' },
      ),
    );

    const { run, customer } = await askOnCustomer('Limited', {
      tools: ['core:timeline'],
      model: { provider: 'kimi', model: chosen },
    });

    expect(run.status).toBe('succeeded');

    const chats = model.chats();
    const results = chats.map((chat) => lastToolResult(chat) ?? '');

    expect(chats[0]?.model).toBe(chosen);
    expect(toolNames(chats[0]).toSorted()).toEqual(['runAction', 'searchActions']);
    expect(results[1]).toContain('core.note.add');
    expect(results[1]).not.toContain('core.notification.send');
    expect(results[2]).toContain('INVALID_STEP_INPUT');
    expect(results[2]).toContain('Note is required');
    expect(results[4]).toContain('ACTION_NOT_ALLOWED');

    const timeline = await owner.activities.list({
      targetType: 'customer',
      targetId: customer.id,
    });

    expect(JSON.stringify(timeline.data)).toContain('Welcomed by the agent');
    expect((await owner.notifications.unreadCount({})).count).toBe(0);
  });

  it('runs a single action picked on its own, and no other of its category', async () => {
    model.script(
      inSteps(
        {
          tool: 'runAction',
          input: { action: 'core.note.add', input: { body: 'Not allowed' } },
        },
        {
          tool: 'runAction',
          input: {
            action: 'core.notification.send',
            input: { title: 'Picked', userIds: [ownerId] },
          },
        },
        { text: 'Notified.' },
      ),
    );

    const before = model.chats().length;
    const { run } = await askOnCustomer('Single', { tools: ['core.notification.send'] });

    const results = model
      .chats()
      .slice(before)
      .map((chat) => lastToolResult(chat) ?? '');

    expect(run.status).toBe('succeeded');
    expect(results[1]).toContain('ACTION_NOT_ALLOWED');
    expect(results[2]).not.toContain('ACTION_NOT_ALLOWED');

    const inbox = await owner.notifications.list({});

    expect(inbox.data.map((item) => item.title)).toContain('Picked');
  });

  it('calls the erxes API only with the step’s API key, by the key’s rules, from any address', async () => {
    const { apiKey } = await owner.apiKeys.create({
      kind: 'regular',
      name: 'Agent reads contacts',
      areas: { contacts: 'read' },
      ownRecords: false,
      unitIds: [],
      tagIds: [],
      allowedIps: ['10.9.9.9'],
      lifetimeDays: 30,
    });

    model.script(
      inSteps(
        { tool: 'callApi', input: { procedure: 'customers.list', input: { search: 'Keyed' } } },
        {
          tool: 'callApi',
          input: {
            procedure: 'tags.create',
            input: { name: 'VIP', type: 'customer', colorCode: '#ff0000' },
          },
        },
        { text: 'Read the customer; tagging is not allowed.' },
      ),
    );

    const before = model.chats().length;
    const { run } = await askOnCustomer('Keyed', { apiKey: apiKey.id });
    const chats = model.chats().slice(before);
    const results = chats.map((chat) => lastToolResult(chat) ?? '');

    expect(run.status).toBe('succeeded');
    expect(toolNames(chats[0])).toEqual(expect.arrayContaining(['searchApi', 'callApi']));
    expect(results[1]).toContain('Keyed');
    expect(results[2]).toContain('KEY_NOT_ALLOWED');
    expect((await owner.tags.list({ type: 'customer' })).data).toEqual([]);
  });

  it('can run every action by default, and has no erxes API without a key', async () => {
    model.script(
      inSteps(
        { tool: 'searchActions', input: { query: 'notify members' } },
        {
          tool: 'runAction',
          input: {
            action: 'core.notification.send',
            input: { title: 'A new customer', userIds: [ownerId] },
          },
        },
        { text: 'Told the owner.' },
      ),
    );

    const before = model.chats().length;
    const { run } = await askOnCustomer('Everything', {});
    const chats = model.chats().slice(before);

    expect(run.status).toBe('succeeded');
    expect(toolNames(chats[0]).toSorted()).toEqual(['runAction', 'searchActions']);
    expect(lastToolResult(chats[1] ?? { model: '', messages: [] })).toContain(
      'core.notification.send',
    );

    const inbox = await owner.notifications.list({});

    expect(inbox.data.map((item) => item.title)).toContain('A new customer');
  });
});
