import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import type { coreContract } from '@erxes/core-contract';
import { db, requestOrgId, withOrg } from '@erxes/core-db';
import type { InferContractRouterInputs } from '@orpc/contract';
import { fail } from '~/http/errors';
import { sessionMember } from '~/modules/apiKeys/apiKeys.service';
import { scoped, unscoped } from '~/orpc';
import {
  agentDetails,
  agentOrThrow,
  conversationsOf,
  createAgent,
  listAgents,
  notifyRun,
  openChat,
  removeAgent,
  restartConversation,
  tryKey,
  updateAgent,
} from './agents.service';
import { madeAgentName } from './agent';
import {
  agentNamed,
  askAgent,
  removeAgent as removeConversation,
  startRun,
  storageKeyOf,
} from './host';
import { conversationRuns, runFailureText } from './runs';
import { StorageBusy } from './storage';

const busy = (error: unknown) => {
  if (error instanceof StorageBusy) {
    throw fail('ASSISTANT_BUSY', 'Another server runs this conversation; try again shortly');
  }

  throw error;
};

type Submit = InferContractRouterInputs<typeof coreContract>['agents']['submit'];

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
    (settled) =>
      settled.status === 'done'
        ? undefined
        : failed(runFailureText(settled.reason, settled.detail)),
    (error: unknown) => failed(error instanceof Error ? error.message : 'failed'),
  );

  return { ok: true as const };
};

/**
 * A member tries an agent from its page: their own conversation with it, as the agent. The run
 * goes on outside the request's transaction, as a plugin's does, since its tools call out.
 */
const tryAgent = async (id: string, text: string, restart: boolean) => {
  const { userId } = sessionMember();
  const orgId = requestOrgId();
  const agent = agentNamed(madeAgentName(id));
  const scope = { orgId, key: tryKey(userId) };

  await withOrg(orgId, async (tx) => {
    await agentOrThrow(tx, id);

    if (restart) await removeConversation(tx, agent, scope);
  });

  return askAgent(agent, scope, { type: 'input', content: text }).catch(busy);
};

/** The runs of the conversations the caller may read, read outside a transaction. */
const runsOf = async (id: string, key: string | undefined) => {
  const orgId = requestOrgId();
  const conversations = await withOrg(orgId, (tx) => conversationsOf(tx, id, key));
  const agent = agentNamed(madeAgentName(id));

  const read = await Promise.all(
    conversations.map(async (conversation) => ({
      ...conversation,
      runs: await conversationRuns(orgId, storageKeyOf(agent, conversation.key)),
    })),
  );

  return { data: key ? read : read.filter((conversation) => conversation.runs.length) };
};

export const agentsRouter = {
  list: scoped.agents.list.handler(() => listAgents(db())),
  get: scoped.agents.get.handler(({ input }) => agentDetails(db(), input.id)),
  create: scoped.agents.create.handler(({ input }) => createAgent(db(), input)),
  update: scoped.agents.update.handler(({ input: { id, ...input } }) =>
    updateAgent(db(), id, input),
  ),
  remove: scoped.agents.remove.handler(({ input }) => removeAgent(db(), input.id)),
  try: unscoped.agents.try.handler(({ input }) => tryAgent(input.id, input.text, input.restart)),
  runs: unscoped.agents.runs.handler(({ input }) => runsOf(input.id, input.key)),
  restart: scoped.agents.restart.handler(({ input }) =>
    restartConversation(db(), input.id, input.key),
  ),
  submit: unscoped.agents.submit.handler(({ input }) => submitToAgent(input)),
};
