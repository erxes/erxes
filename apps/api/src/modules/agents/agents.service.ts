import type {
  AgentTemplate,
  ApiKeyActions,
  ApiKeyAreas,
  ApiKeyPlugins,
  AssistantProvider,
} from '@erxes/core-contract';
import { agentChats, agents, apiKeys, caller, type Db, newId, withOrg } from '@erxes/core-db';
import { and, desc, eq, sql } from 'drizzle-orm';
import { fail, notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { createApiKey, sessionMember } from '~/modules/apiKeys/apiKeys.service';
import { findConnection, usableKey } from '~/modules/assistant/connections.service';
import { DEFAULT_MODELS } from '~/modules/assistant/providers';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { publishCoreEvents } from '~/modules/events/events.service';

const log = logger.child({ component: 'agents' });

/** `core.agent.finished` or `failed`, which only the payload's plugin receives (pluginEvents). */
export const notifyRun = (orgId: string, type: string, payload: Record<string, unknown>) =>
  withOrg(orgId, (client) => publishCoreEvents(client, { type, payload })).catch((error: unknown) =>
    log.warn({ err: error, type }, 'agents: could not publish a run event'),
  );

/**
 * The key and model an agent runs on: the provider and model chosen for it, else the
 * organisation's default provider and its default model.
 */
export const modelKey = async (
  client: Db,
  chosen: { provider: AssistantProvider | null; model: string | null } = {
    provider: null,
    model: null,
  },
) => {
  const key = await usableKey(client, chosen.provider ?? undefined);

  return { ...key, model: chosen.model ?? DEFAULT_MODELS[key.provider] };
};

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

interface AgentFields {
  name: string;
  instructions: string;
  provider: AssistantProvider | null;
  model: string | null;
  customers: boolean;
}

const mustHaveKey = async (client: Db, provider: AssistantProvider | null | undefined) => {
  if (provider && !(await findConnection(client, provider))) throw notFound('Connection');
};

/**
 * Makes an agent and its API key: a regular key in the maker's name, its secret thrown away,
 * so the agent never holds more than the maker could give.
 */
export const createAgent = async (
  client: Db,
  input: AgentFields & {
    template: AgentTemplate | null;
    access: { areas: ApiKeyAreas; pluginAccess: ApiKeyPlugins; actions: ApiKeyActions };
  },
) => {
  const me = sessionMember();

  await mustHaveKey(client, input.provider);

  const { apiKey } = await createApiKey(client, {
    kind: 'regular',
    name: `Agent: ${input.name}`,
    ...input.access,
    ownRecords: false,
    unitIds: [],
    tagIds: [],
    allowedIps: [],
    lifetimeDays: null,
  });

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
      customers: input.customers,
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

export const updateAgent = async (client: Db, id: string, input: Partial<AgentFields>) => {
  const before = await agentOrThrow(client, id);

  await mustHaveKey(client, input.provider);

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
  input: { agentId: string; key: string; customerId: string | null },
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
