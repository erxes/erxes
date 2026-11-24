import { newId, roles, users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
import { OPENAI_KEY, startDecisionServer, TYPESAFE_KEY } from './decisionServer.fixture';
import { settle } from './settle';

const note = (id: string, body: string) => action(id, 'core.note.add', { body });

const decideStep = (
  provider: 'typesafe' | 'openai',
  overrides: {
    question?: string;
    state?: string;
    model?: string;
    minConfidence?: number;
    connection?: string;
  } = {},
) => ({
  id: 'pick',
  type: 'decide' as const,
  provider,
  question: overrides.question ?? 'Which team should take {{subject.firstName}}?',
  state: overrides.state ?? 'Note: {{subject.lastName}}',
  model: overrides.model,
  minConfidence: overrides.minConfidence,
  connection: overrides.connection,
  paths: [
    {
      label: 'billing',
      meaning: 'Invoices and charges',
      steps: [note('b', 'Billing {{steps.pick.output.path}} {{steps.pick.output.confidence}}')],
    },
    {
      label: 'support',
      meaning: 'Bugs and help',
      steps: [note('s', 'Support {{steps.pick.output.path}}')],
    },
  ],
  otherwise: [note('o', 'Fallback {{steps.pick.output.path}} {{steps.pick.output.choice}}')],
});

describe('automation decision model node', { timeout: 180_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  let remote: Awaited<ReturnType<typeof startDecisionServer>>;

  beforeAll(async () => {
    remote = await startDecisionServer();
    Object.assign(config.assistant.endpoints, { typesafe: remote.url, openai: remote.url });
  });

  afterAll(() => remote.close());

  const connect = (key: 'typesafe' | 'openai', apiKey: string, name: string) =>
    t.owner().integrations.connect({ key, name, keys: { apiKey } });

  it('lists TypeSafe in decision, lists selectable models, and validates definitions', async () => {
    const listed = (await t.owner().integrations.list()).data;

    expect(listed.find((item) => item.key === 'typesafe')?.category).toBe('decision');
    expect(listed.find((item) => item.key === 'openai')?.category).toBe('ai');

    await expect(connect('typesafe', 'wrong-key', 'TypeSafe bad')).rejects.toMatchObject({
      status: 400,
      code: 'GATEWAY_REFUSED',
    });

    const draft = await t.owner().automations.create({
      name: 'Needs setup',
      definition: forCustomer('Draft', [decideStep('typesafe', { question: '' })]),
    });

    await expect(t.owner().automations.activate({ id: draft.id })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_AUTOMATION',
      data: {
        problems: [
          'Step pick: ask the model a question',
          'Step pick: connect TypeSafe in Settings › Integrations',
        ],
      },
    });

    expect(await t.owner().automations.decisionModels({ provider: 'typesafe' })).toEqual({
      defaultModel: 'jev-latest',
      defaultModelName: 'Jev latest',
      models: [],
      error: null,
    });

    const tsConn = await connect('typesafe', TYPESAFE_KEY, 'TypeSafe');

    expect((await t.owner().assistant.providers({})).data).toEqual([]);

    expect(
      await t.owner().automations.decisionModels({ provider: 'typesafe', connection: tsConn.id }),
    ).toEqual({
      defaultModel: 'jev-latest',
      defaultModelName: 'Jev latest',
      models: [
        { id: 'jev-latest', name: 'Jev latest', recommended: true },
        { id: 'jev-1.14.0', name: 'Jev 1.14.0', recommended: false },
        { id: 'jev-1.13.0', name: 'Jev 1.13.0', recommended: false },
        { id: 'jev-preview', name: 'Jev preview', recommended: false },
      ],
      error: null,
    });

    remote.next.typeSafeModelsStatus = 404;
    expect(await t.owner().automations.decisionModels({ provider: 'typesafe' })).toEqual({
      defaultModel: 'jev-latest',
      defaultModelName: 'Jev latest',
      models: [
        { id: 'jev-latest', name: 'Jev latest', recommended: true },
        { id: 'jev-preview', name: 'Jev preview', recommended: false },
      ],
      error: null,
    });
    remote.next.typeSafeModelsStatus = 200;

    expect(await t.other().automations.decisionModels({ provider: 'typesafe' })).toEqual({
      defaultModel: 'jev-latest',
      defaultModelName: 'Jev latest',
      models: [],
      error: null,
    });

    await expect(
      t.other().automations.decisionModels({ provider: 'typesafe', connection: tsConn.id }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });

    await expect(
      t.member().automations.decisionModels({ provider: 'typesafe' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });
  });

  it('routes through TypeSafe Jev, falls back on low confidence, and dry-runs without calling out', async () => {
    const id = await t.active(
      'Jev triage',
      forCustomer('JevHigh', [decideStep('typesafe', { minConfidence: 0.7 })]),
    );

    const lowId = await t.active(
      'Jev low',
      forCustomer('JevLow', [decideStep('typesafe', { minConfidence: 0.7 })]),
    );

    const probe = await t.owner().customers.create({ firstName: 'Probe', lastName: 'Dry' });
    const callsBefore = remote.jevCalls.length;

    const dry = await t.owner().automations.test({
      id,
      subjectType: 'customer',
      subjectId: probe.id,
    });

    expect(remote.jevCalls).toHaveLength(callsBefore);
    expect(dry.trace[0]).toMatchObject({
      stepId: 'pick',
      outcome: 'Would ask TypeSafe to pick a path; assumed path 1 (billing)',
      input: { question: 'Which team should take Probe?', state: 'Note: Dry' },
    });
    expect(dry.trace[1]).toMatchObject({ stepId: 'b', input: { body: 'Billing billing ' } });

    await t.owner().customers.create({ firstName: 'JevHigh', lastName: 'Double charge' });
    await settle();

    const high = await t.onlyRun(id);

    expect(high.run.status).toBe('succeeded');
    expect(high.steps.map((step) => step.stepId)).toEqual(['pick', 'b']);
    expect(high.steps[0]?.output).toEqual({ path: 'billing', ...remote.next.jev });
    expect(high.steps[1]?.input).toEqual({ body: 'Billing billing 0.92' });
    expect(remote.jevCalls.at(-1)).toEqual({
      model: 'jev-latest',
      state: 'Note: Double charge',
      questions: {
        path: {
          type: 'choice',
          instructions: 'Which team should take JevHigh?',
          criteria: {
            billing: 'Invoices and charges',
            support: 'Bugs and help',
            otherwise: 'None of the other options fits',
          },
        },
      },
    });

    remote.next.jev = {
      choice: 'billing',
      confidence: 0.45,
      probabilities: { billing: 0.45, support: 0.4, otherwise: 0.15 },
      model: 'jev-1.14.0',
    };
    await t.owner().customers.create({ firstName: 'JevLow', lastName: 'Unsure' });
    await settle();

    const low = await t.onlyRun(lowId);

    expect(low.steps.map((step) => step.stepId)).toEqual(['pick', 'o']);
    expect(low.steps[0]?.output).toMatchObject({
      path: 'otherwise',
      choice: 'billing',
      confidence: 0.45,
    });
    expect(low.steps[1]?.input).toEqual({ body: 'Fallback otherwise billing' });
  });

  it('reuses the OpenAI AI provider connection, lists chat models, and enforces assistant.manage', async () => {
    const conn = await connect('openai', OPENAI_KEY, 'OpenAI');

    expect((await t.owner().assistant.providers({})).data).toEqual([{ provider: 'openai' }]);

    const openAiCatalog = await t
      .owner()
      .automations.decisionModels({ provider: 'openai', connection: conn.id });

    expect(openAiCatalog.error).toBeNull();
    expect(openAiCatalog.models.map((item) => item.id)).toEqual(['gpt-5.6-luna', 'gpt-4o-mini']);
    expect(openAiCatalog.models.find((item) => item.id === 'gpt-4o-mini')?.name).toBe(
      'GPT-4o mini',
    );

    const okId = await t.active(
      'OpenAI triage',
      forCustomer('OpenAiOk', [decideStep('openai', { model: 'gpt-4o-mini' })]),
    );

    const fallbackId = await t.active(
      'OpenAI fallback',
      forCustomer('OpenAiOther', [decideStep('openai')]),
    );

    await t.owner().customers.create({ firstName: 'OpenAiOk', lastName: 'Crash report' });
    await settle();

    const okRun = await t.onlyRun(okId);

    expect(okRun.steps.map((step) => step.stepId)).toEqual(['pick', 's']);
    expect(okRun.steps[0]?.output).toEqual({
      path: 'support',
      choice: 'support',
      confidence: null,
      probabilities: null,
      model: 'gpt-5.6-luna',
    });
    expect(remote.openAiCalls.at(-1)?.model).toBe('gpt-4o-mini');
    expect(
      remote.openAiCalls.at(-1)?.response_format.json_schema.schema.properties.choice.enum,
    ).toEqual(['billing', 'support', 'otherwise']);

    remote.next.openai = { choice: 'otherwise', model: 'gpt-5.6-luna' };
    await t.owner().customers.create({ firstName: 'OpenAiOther', lastName: 'Hello' });
    await settle();
    expect((await t.onlyRun(fallbackId)).steps.map((step) => step.stepId)).toEqual(['pick', 'o']);

    const roleKey = (
      await t.owner().roles.create({
        name: 'Auto AI',
        permissions: ['automations.view', 'automations.manage', 'assistant.manage'],
      })
    ).key;

    const userId = newId();

    await adminDb().insert(users).values({
      id: userId,
      orgId: t.ids.org,
      email: 'auto@acme.mn',
      role: roleKey,
      status: 'active',
    });

    const limited = t.client({ user: userId, org: t.ids.org });

    const created = await limited.automations.create({
      name: 'Revoked permission',
      definition: forCustomer('Revoked', [decideStep('openai', { connection: conn.id })]),
    });

    await limited.automations.activate({ id: created.id });
    await adminDb()
      .update(roles)
      .set({ permissions: ['automations.view', 'automations.manage'] })
      .where(eq(roles.key, roleKey));
    await t.owner().customers.create({ firstName: 'Revoked', lastName: 'Blocked' });
    await settle();

    const blocked = await t.onlyRun(created.id);

    expect(blocked.run.status).toBe('failed');
    expect(blocked.run.error).toContain('may no longer use OpenAI');
  });
});
