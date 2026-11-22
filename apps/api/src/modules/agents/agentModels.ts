import type { AssistantProvider } from '@erxes/core-contract';
import { agentModels, type Db } from '@erxes/core-db';
import { asc, eq, sql } from 'drizzle-orm';
import { notFound } from '~/http/errors';
import { wholeList } from '~/lib/keyset';
import { connectedProviders } from '~/modules/assistant/connectedProviders';
import { modelKey } from '~/modules/assistant/connections.service';

/**
 * The key and model `agent` runs on: the provider and model an admin chose for it, else the
 * assistant settings' default model.
 */
export const agentModelKey = async (client: Db, agent: string) => {
  const [chosen] = await client
    .select()
    .from(agentModels)
    .where(eq(agentModels.agent, agent))
    .limit(1);

  return modelKey(client, chosen ? { provider: chosen.provider, model: chosen.model } : {});
};

export const listAgentModels = async (client: Db) => ({
  data: await wholeList((limit) =>
    client.select().from(agentModels).orderBy(asc(agentModels.agent)).limit(limit),
  ),
});

export const setAgentModel = async (
  client: Db,
  agent: string,
  provider: AssistantProvider,
  model: string,
) => {
  if (!(await connectedProviders(client)).some((entry) => entry.provider === provider)) {
    throw notFound('Connection');
  }

  const [row] = await client
    .insert(agentModels)
    .values({ agent, provider, model })
    .onConflictDoUpdate({
      target: [agentModels.orgId, agentModels.agent],
      set: { provider, model, updatedAt: sql`now()` },
    })
    .returning();

  if (!row) throw new Error('The agent model was not returned');

  return row;
};
