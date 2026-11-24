import { once } from 'node:events';
import { createServer, type ServerResponse } from 'node:http';
import { newId, roles, users } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

const TYPESAFE_KEY = 'ts-test-key-0001';
const OPENAI_KEY = 'sk-test-key-0001';

const JevRequest = z.object({
  model: z.string(),
  state: z.string(),
  questions: z.object({
    path: z.object({
      type: z.literal('choice'),
      instructions: z.string(),
      criteria: z.record(z.string(), z.string().nullable()),
    }),
  }),
});

const OpenAiRequest = z.object({
  model: z.string(),
  messages: z.array(z.object({ role: z.string(), content: z.string() })),
  response_format: z.object({
    type: z.literal('json_schema'),
    json_schema: z.object({
      strict: z.literal(true),
      schema: z.object({
        properties: z.object({ choice: z.object({ enum: z.array(z.string()) }) }),
      }),
    }),
  }),
});

const note = (id: string, body: string) => action(id, 'core.note.add', { body });

const sendJson = (res: ServerResponse, status: number, body: unknown) =>
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));

const decideStep = (
  provider: 'typesafe' | 'openai',
  overrides: {
    question?: string;
    state?: string;
    minConfidence?: number;
    connection?: string;
  } = {},
) => ({
  id: 'pick',
  type: 'decide' as const,
  provider,
  question: overrides.question ?? 'Which team should take {{subject.firstName}}?',
  state: overrides.state ?? 'Note: {{subject.lastName}}',
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

const startDecisionServer = async () => {
  const jevCalls: z.infer<typeof JevRequest>[] = [];
  const openAiCalls: z.infer<typeof OpenAiRequest>[] = [];

  const next = {
    jev: {
      choice: 'billing',
      confidence: 0.92,
      probabilities: { billing: 0.92, support: 0.05, otherwise: 0.03 },
      model: 'jev-1.14.0',
    },
    openai: { choice: 'support', model: 'gpt-5.6-luna' },
  };

  const server = createServer((req, res) => {
    let raw = '';

    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString();
    });
    req.on('end', () => {
      const auth = req.headers.authorization;
      const url = req.url ?? '';

      if (url.endsWith('/models')) {
        const ok = auth === `Bearer ${TYPESAFE_KEY}` || auth === `Bearer ${OPENAI_KEY}`;

        sendJson(res, ok ? 200 : 401, ok ? { data: [{ id: 'jev-latest' }] } : { error: 'Denied' });

        return;
      }

      if (url.endsWith('/systemone') && auth === `Bearer ${TYPESAFE_KEY}`) {
        jevCalls.push(JevRequest.parse(JSON.parse(raw)));
        sendJson(res, 200, {
          model: next.jev.model,
          answers: { path: { type: 'choice', ...next.jev } },
        });

        return;
      }

      if (url.endsWith('/chat/completions') && auth === `Bearer ${OPENAI_KEY}`) {
        openAiCalls.push(OpenAiRequest.parse(JSON.parse(raw)));
        sendJson(res, 200, {
          model: next.openai.model,
          choices: [{ message: { content: JSON.stringify({ choice: next.openai.choice }) } }],
        });

        return;
      }

      sendJson(res, 401, { error: 'Unauthorized' });
    });
  }).listen(0);

  await once(server, 'listening');

  const address = server.address();

  if (!address || typeof address === 'string') throw new Error('not listening on a port');

  return {
    url: `http://127.0.0.1:${address.port}/v1`,
    jevCalls,
    openAiCalls,
    next,
    close: () => {
      server.closeAllConnections();

      return new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
};

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

  it('lists TypeSafe in the decision category, rejects bad keys, and validates definitions', async () => {
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

    await connect('typesafe', TYPESAFE_KEY, 'TypeSafe');
    expect((await t.owner().assistant.providers({})).data).toEqual([]);
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
    expect(dry.trace[1]).toMatchObject({
      stepId: 'b',
      input: { body: 'Billing billing ' },
    });

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

  it('reuses the OpenAI AI provider connection and enforces assistant.manage at runtime', async () => {
    const conn = await connect('openai', OPENAI_KEY, 'OpenAI');

    expect((await t.owner().assistant.providers({})).data).toEqual([{ provider: 'openai' }]);

    const okId = await t.active('OpenAI triage', forCustomer('OpenAiOk', [decideStep('openai')]));

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
