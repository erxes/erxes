import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { applyImmutable } from '@earendil-works/chord/delta';
import { createModels } from '@earendil-works/pi-ai/models';
import { fauxAssistantMessage, fauxProvider } from '@earendil-works/pi-ai/providers/faux';
import { type ConversationView, createRegistry, Harness } from '@earendil-works/pi-durable';
import { newId } from '@erxes/core-db';
import { afterAll, describe, expect, it } from 'vite-plus/test';
import type { Agent } from '~/modules/agents/agent';
import { closeAgents, watchConversation, withHarness } from '~/modules/agents/host';
import { openAgentStorage } from '~/modules/agents/storage';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const faux = fauxProvider();
const models = createModels();

models.setProvider(faux.provider);

const model = { provider: faux.provider.id, modelId: faux.getModel().id };

const agent: Agent = {
  name: 'probe',
  setup: async () => ({ models, extensions: [], agent: { model } }),
};

const answered = (view: ConversationView | undefined) =>
  JSON.stringify(view?.entries ?? []).includes('Ulaanbaatar');

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

    let view: ConversationView | undefined;

    for await (const event of watchConversation(
      agent,
      scope,
      rootId,
      new AbortController().signal,
    )) {
      view = 'value' in event ? event.value : applyImmutable(view, event.ops);

      if (answered(view)) break;
    }

    expect(answered(view)).toBe(true);
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
