import { AGENT_RUNS_MAX, type AgentSettings, type NewAgent } from '@erxes/core-contract';
import {
  agentChats,
  agents,
  apiKeys,
  caller,
  type Db,
  newId,
  portals,
  requestOrgId,
  withOrg,
} from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { agentKey, createApiKey, sessionMember } from '~/modules/apiKeys/apiKeys.service';
import { connectedProviders } from '~/modules/assistant/connectedProviders';
import { chosenModel } from '~/modules/assistant/connections.service';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';
import { madeAgentName } from './agent';
import { agentNamed, removeAgent as removeConversation } from './host';

const log = logger.child({ component: 'agents' });

/** `core.agent.finished` or `failed`, which only the payload's plugin receives (pluginEvents). */
export const notifyRun = (orgId: string, type: string, payload: Record<string, unknown>) =>
  withOrg(orgId, (client) => publishCoreEvents(client, { type, payload })).catch((error: unknown) =>
    log.warn({ err: error, type }, 'agents: could not publish a run event'),
  );

export const listAgents = async (client: Db) => ({
  data: await wholeList((limit) =>
    client.select().from(agents).orderBy(desc(agents.createdAt)).limit(limit),
  ),
});

export const agentOrThrow = async (client: Db, id: string) => {
  const [row] = await client.select().from(agents).where(eq(agents.id, id)).limit(1);

  if (!row) throw notFound('Agent');

  return row;
};

/** A provider it runs on is connected in Integrations, and a portal it serves is the organisation's. */
const checkSettings = async (
  client: Db,
  { provider, portalId }: Partial<Pick<AgentSettings, 'provider' | 'portalId'>>,
) => {
  if (
    provider &&
    !(await connectedProviders(client)).some((entry) => entry.provider === provider)
  ) {
    throw notFound('Connection');
  }

  if (portalId) {
    const [portal] = await client
      .select({ id: portals.id })
      .from(portals)
      .where(eq(portals.id, portalId))
      .limit(1);

    if (!portal) throw notFound('Portal');
  }
};

/**
 * Makes an agent and its API key: a regular key in the maker's name, its secret thrown away,
 * so the agent never holds more than the maker could give.
 */
export const createAgent = async (client: Db, input: NewAgent) => {
  const me = sessionMember();

  await checkSettings(client, input);

  const { apiKey } = await createApiKey(
    client,
    {
      kind: 'regular',
      name: `Agent: ${input.name}`,
      ...input.access,
      ownRecords: false,
      unitIds: [],
      tagIds: [],
      allowedIps: [],
      lifetimeDays: null,
    },
    { forAgent: true },
  );

  const [row] = await client
    .insert(agents)
    .values({
      id: newId(),
      name: input.name,
      template: input.template,
      instructions: input.instructions,
      provider: input.provider,
      model: input.model,
      keyId: apiKey.id,
      portalId: input.portalId,
      createdBy: me.userId,
    })
    .returning();

  const agent = oneRow(row ? [row] : []);

  await recordAudit(client, {
    action: 'agent.created',
    targetType: 'agent',
    targetId: agent.id,
    targetLabel: agent.name,
  });

  return agent;
};

export const updateAgent = async (client: Db, id: string, input: Partial<AgentSettings>) => {
  const before = await agentOrThrow(client, id);

  await checkSettings(client, input);

  const [row] = await client
    .update(agents)
    .set({ ...input, updatedAt: sql`now()` })
    .where(eq(agents.id, id))
    .returning();

  if (input.name && input.name !== before.name) {
    await client
      .update(apiKeys)
      .set({ name: `Agent: ${input.name}` })
      .where(eq(apiKeys.id, before.keyId));
  }

  await recordAudit(client, {
    action: 'agent.updated',
    targetType: 'agent',
    targetId: id,
    targetLabel: row?.name ?? before.name,
  });

  return oneRow(row ? [row] : []);
};

/** Deletes the agent with its key and conversations' records; its stored chats stay until they expire. */
export const removeAgent = async (client: Db, id: string) => {
  const row = await agentOrThrow(client, id);

  await client.delete(apiKeys).where(eq(apiKeys.id, row.keyId));

  await recordAudit(client, {
    action: 'agent.removed',
    targetType: 'agent',
    targetId: id,
    targetLabel: row.name,
  });

  return { ok: true as const };
};

/**
 * Fixes a conversation's plugin and customer on its first message, and refuses another plugin
 * or customer after that.
 */
export const openChat = async (
  client: Db,
  input: Pick<typeof agentChats.$inferSelect, 'agentId' | 'key' | 'customerId'>,
) => {
  const { plugin } = caller('plugin');

  await client
    .insert(agentChats)
    .values({ agentId: input.agentId, key: input.key, plugin, customerId: input.customerId })
    .onConflictDoNothing();

  const [chat] = await client
    .select()
    .from(agentChats)
    .where(and(eq(agentChats.agentId, input.agentId), eq(agentChats.key, input.key)))
    .limit(1);

  if (!chat || chat.plugin !== plugin) throw notFound('Agent conversation');

  if (chat.customerId !== input.customerId) {
    const message = 'This conversation is with another customer; start a new one';

    throw fail('INVALID_INPUT', message, { issues: [{ path: ['customerId'], message }] });
  }

  return chat;
};

export const chatOf = async (client: Db, agentId: string, key: string) => {
  const [chat] = await client
    .select()
    .from(agentChats)
    .where(and(eq(agentChats.agentId, agentId), eq(agentChats.key, key)))
    .limit(1);

  return chat ?? null;
};

/** One agent for its page: its key, the model it runs on now, and the plugins that send to it. */
export const agentDetails = async (client: Db, id: string) => {
  const agent = await agentOrThrow(client, id);

  const { connection, model } = await chosenModel(client, {
    provider: agent.provider ?? undefined,
    model: agent.model ?? undefined,
  });

  const senders = await client
    .selectDistinct({ plugin: agentChats.plugin })
    .from(agentChats)
    .where(eq(agentChats.agentId, id));

  return {
    ...agent,
    key: await agentKey(client, agent.keyId),
    runsOn: connection && model ? { provider: connection.provider, model } : null,
    plugins: senders.map((sender) => sender.plugin),
  };
};

/** A member's own conversation with an agent from its page. */
export const tryKey = (userId: string) => `try-${userId}`;

/** The conversation as the caller may reach it: a plugin only its own, else 404. */
const reachableChat = async (client: Db, agentId: string, key: string) => {
  await agentOrThrow(client, agentId);

  const chat = await chatOf(client, agentId, key);
  const who = caller();

  if (who.type === 'plugin' && chat?.plugin !== who.plugin) throw notFound('Agent conversation');

  return chat;
};

/**
 * The conversations whose runs the caller reads: the one `key` names, else a member's own Try it
 * and the agent's newest conversations, a plugin only its own.
 */
export const conversationsOf = async (client: Db, agentId: string, key: string | undefined) => {
  if (key) {
    const chat = await reachableChat(client, agentId, key);

    return [{ key, plugin: chat?.plugin ?? null, customerId: chat?.customerId ?? null }];
  }

  await agentOrThrow(client, agentId);

  const who = caller();

  const chats = await client
    .select({ key: agentChats.key, plugin: agentChats.plugin, customerId: agentChats.customerId })
    .from(agentChats)
    .where(
      and(
        eq(agentChats.agentId, agentId),
        who.type === 'plugin' ? eq(agentChats.plugin, who.plugin) : undefined,
      ),
    )
    .orderBy(desc(agentChats.createdAt))
    .limit(AGENT_RUNS_MAX);

  const own =
    who.type === 'user' ? [{ key: tryKey(who.userId), plugin: null, customerId: null }] : [];

  return [...own, ...chats].slice(0, AGENT_RUNS_MAX);
};

/** Forgets what the agent said in one conversation (`removeConversation`), keeping its chat. */
export const restartConversation = async (client: Db, agentId: string, key: string) => {
  await reachableChat(client, agentId, key);
  await removeConversation(client, agentNamed(madeAgentName(agentId)), {
    orgId: requestOrgId(),
    key,
  });

  await recordAudit(client, {
    action: 'agent.conversation_restarted',
    targetType: 'agent',
    targetId: agentId,
    targetLabel: key,
  });

  return { ok: true as const };
};
