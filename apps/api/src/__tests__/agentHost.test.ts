import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { applyImmutable } from '@earendil-works/chord/delta';
import type { AssistantMessage } from '@earendil-works/pi-ai';
import { createModels } from '@earendil-works/pi-ai/models';
import {
  fauxAssistantMessage,
  fauxProvider,
  fauxToolCall,
} from '@earendil-works/pi-ai/providers/faux';
import {
  type ConversationView,
  createRegistry,
  defineExtension,
  Harness,
} from '@earendil-works/pi-durable';
import { newId, schema, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import type { Agent, AgentScope } from '~/modules/agents/agent';
import {
  closeAgents,
  registerAgent,
  startRun,
  watchConversation,
  withHarness,
} from '~/modules/agents/host';
import { recoverAgents } from '~/modules/agents/recovery';
import { openAgentStorage } from '~/modules/agents/storage';
import { agentTool } from '~/modules/agents/tool';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const faux = fauxProvider();
const models = createModels();

models.setProvider(faux.provider);

const model = { provider: faux.provider.id, modelId: faux.getModel().id };

const ping = agentTool({
  name: 'ping',
  description: 'Answers pong.',
  input: z.object({}),
  execute: () => 'pong',
});

const agent: Agent = {
  name: 'probe',
  setup: async () => ({
    models,
    extensions: [defineExtension({ name: 'probe', tools: [ping] })],
    // A request a restart cut off counts as a failed attempt; retry it at once.
    settings: { retry: { baseDelayMs: 1 } },
    agent: { model },
  }),
};

registerAgent(agent);

const answered = (view: ConversationView | undefined) =>
  JSON.stringify(view?.entries ?? []).includes('Ulaanbaatar');

/** How the newest run without an answer ended (`pi.live.runFailure`). */
const failure = (view: ConversationView | undefined) =>
  z
    .object({ runFailure: z.object({ reason: z.string(), detail: z.string() }) })
    .safeParse(view?.docs['pi.live']).data?.runFailure;

/** The conversation as a watcher sees it, until `done` holds for the view. */
const watchUntil = async (
  scope: AgentScope,
  conversationId: Parameters<typeof watchConversation>[2],
  done: (view: ConversationView | undefined) => boolean,
) => {
  let view: ConversationView | undefined;

  for await (const event of watchConversation(
    agent,
    scope,
    conversationId,
    new AbortController().signal,
  )) {
    view = 'value' in event ? event.value : applyImmutable(view, event.ops);

    if (done(view)) break;
  }

  return view;
};

describe('agent host', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  afterAll(closeAgents);

  it('runs a reply and streams it to a watcher as it commits', async () => {
    const scope = { orgId: t.ids.org, key: newId() };

    faux.setResponses([fauxAssistantMessage('The capital is Ulaanbaatar.')]);

    const rootId = await withHarness(agent, scope, async (harness) => {
      const root = await harness.root(BACKGROUND_CONTEXT);

      await root.submit({ type: 'input', content: 'Capital of Mongolia?' }, BACKGROUND_CONTEXT);

      return root.id;
    });

    expect(answered(await watchUntil(scope, rootId, answered))).toBe(true);
  });

  it('resumes a run a crash cut off once its lease runs out', async () => {
    const scope = { orgId: t.ids.org, key: newId() };
    const storageKey = `probe:${scope.key}`;

    const crashed = await Harness.open(
      await openAgentStorage(scope.orgId, storageKey),
      { models, registry: createRegistry() },
      BACKGROUND_CONTEXT,
    );

    const late: { answer?: (message: AssistantMessage) => void } = {};

    const asked = new Promise<void>((resolve) => {
      faux.setResponses([
        () => {
          resolve();

          return new Promise<AssistantMessage>((answer) => {
            late.answer = answer;
          });
        },
        fauxAssistantMessage('The capital is Ulaanbaatar.'),
      ]);
    });

    const root = await crashed.root(BACKGROUND_CONTEXT, { agent: { model } });

    await root.submit({ type: 'input', content: 'Capital?' }, BACKGROUND_CONTEXT);
    await asked;

    // The server dies while the model answers: its lease runs out with the run unfinished.
    await withSystem('test: a server crashed', (tx) =>
      tx
        .update(schema.agentDurableMetadata)
        .set({ leaseUntil: new Date(Date.now() - 1000) })
        .where(eq(schema.agentDurableMetadata.storageKey, storageKey)),
    );

    expect(await recoverAgents()).toContain(storageKey);
    expect(answered(await watchUntil(scope, root.id, answered))).toBe(true);

    late.answer?.(fauxAssistantMessage('Too late.'));
    await crashed.close(BACKGROUND_CONTEXT);
  });

  it('ends a run that reaches the turn limit with a failure', async () => {
    const scope = { orgId: t.ids.org, key: newId() };

    faux.setResponses(
      Array.from({ length: config.agents.maxTurns + 1 }, () =>
        fauxAssistantMessage(fauxToolCall('ping', {}), { stopReason: 'toolUse' }),
      ),
    );

    const submission = await startRun(agent, scope, { type: 'input', content: 'Ping forever.' });
    const settled = await submission.wait(BACKGROUND_CONTEXT);
    const view = await watchUntil(scope, settled.conversationId, (seen) => !!failure(seen));

    expect(settled.status).toBe('unanswered');
    expect(failure(view)).toEqual({
      reason: 'turn_limit',
      detail: `${config.agents.maxTurns} turns`,
    });
  });

  it('shows what another server committed, and ends', async () => {
    const scope = { orgId: t.ids.org, key: newId() };
    const storage = await openAgentStorage(scope.orgId, `probe:${scope.key}`);

    const other = await Harness.open(
      storage,
      { models, registry: createRegistry() },
      BACKGROUND_CONTEXT,
    );

    faux.setResponses([fauxAssistantMessage('The capital is Ulaanbaatar.')]);

    const root = await other.root(BACKGROUND_CONTEXT, { agent: { model } });

    const submission = await root.submit(
      { type: 'input', content: 'Capital?' },
      BACKGROUND_CONTEXT,
    );

    await submission.wait(BACKGROUND_CONTEXT);

    const events = [];

    for await (const event of watchConversation(
      agent,
      scope,
      root.id,
      new AbortController().signal,
    ))
      events.push(event);

    await other.close(BACKGROUND_CONTEXT);

    expect(events).toHaveLength(1);
    expect(answered(events[0] && 'value' in events[0] ? events[0].value : undefined)).toBe(true);
  });
});
