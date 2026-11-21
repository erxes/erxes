import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { db, requestOrgId, withOrg } from '@erxes/core-db';
import { fail } from '~/http/errors';
import { agentKey, sessionMember } from '~/modules/apiKeys/apiKeys.service';
import { scoped, unscoped } from '~/orpc';
import {
  agentOrThrow,
  createAgent,
  listAgents,
  notifyRun,
  openChat,
  removeAgent,
  updateAgent,
} from './agents.service';
import { madeAgentName } from './agent';
import { agentNamed, askAgent, removeAgent as removeConversation, startRun } from './host';
import { StorageBusy } from './storage';

const busy = (error: unknown) => {
  if (error instanceof StorageBusy) {
    throw fail('ASSISTANT_BUSY', 'Another server runs this conversation; try again shortly');
  }

  throw error;
};

interface Submit {
  id: string;
  key: string;
  customerId?: string | undefined;
  text: string;
  requestId?: string | undefined;
}

/** A plugin's message into one conversation of an agent; the run goes on after this returns. */
const submitToAgent = async ({ id, key, customerId, text, requestId }: Submit) => {
  const orgId = requestOrgId();

  const chat = await withOrg(orgId, async (tx) => {
    await agentOrThrow(tx, id);

    return openChat(tx, { agentId: id, key, customerId: customerId ?? null });
  });

  const scope = { orgId, key };

  const submission = await startRun(agentNamed(madeAgentName(id)), scope, {
    type: 'input',
    content: text,
    ...(requestId ? { requestId } : {}),
  }).catch(busy);

  // An answer reaches the plugin from the run (madeAgent); a run that ends without one, from here.
  const failed = (reason: string) =>
    notifyRun(orgId, 'core.agent.failed', { agentId: id, plugin: chat.plugin, key, reason });

  void submission.wait(BACKGROUND_CONTEXT).then(
    (settled) => (settled.status === 'done' ? undefined : failed(settled.status)),
    (error: unknown) => failed(error instanceof Error ? error.message : 'failed'),
  );

  return { ok: true as const };
};

/** A member tries an agent from its page: their own conversation with it, as the agent. */
const tryAgent = async (id: string, text: string, restart: boolean) => {
  const { userId } = sessionMember();
  const orgId = requestOrgId();

  await agentOrThrow(db(), id);

  const agent = agentNamed(madeAgentName(id));
  const scope = { orgId, key: `try-${userId}` };

  if (restart) await removeConversation(db(), agent, scope);

  return askAgent(agent, scope, text).catch(busy);
};

export const agentsRouter = {
  list: scoped.agents.list.handler(() => listAgents(db())),
  get: scoped.agents.get.handler(async ({ input }) => {
    const agent = await agentOrThrow(db(), input.id);

    return { ...agent, key: await agentKey(db(), agent.keyId) };
  }),
  create: scoped.agents.create.handler(({ input }) => createAgent(db(), input)),
  update: scoped.agents.update.handler(({ input: { id, ...input } }) =>
    updateAgent(db(), id, input),
  ),
  remove: scoped.agents.remove.handler(({ input }) => removeAgent(db(), input.id)),
  try: scoped.agents.try.handler(({ input }) => tryAgent(input.id, input.text, input.restart)),
  submit: unscoped.agents.submit.handler(({ input }) => submitToAgent(input)),
};
