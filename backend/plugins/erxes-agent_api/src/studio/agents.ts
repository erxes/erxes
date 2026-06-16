/**
 * Agent-registration bridge (native reuse).
 *
 * Reuses the production builder `getOrCreateAgent(cfg, models, subdomain)`.
 * Passing the subdomain makes the builder attach the NATIVE Mastra Memory
 * (semantic recall + working memory on Mongo `erxes_mastra_memory` + Qdrant, via
 * getMastraMemory) whenever ERXES_AGENT_MEMORY=enable and the agent's
 * memoryEnabled !== false — so Studio lists each real agent AND its per-agent
 * history tab lights up, with zero schema translation. Resilient per-agent: a
 * build failure (gateway down, missing provider key) is logged and skipped.
 *
 * NOTE: chatting in Studio invokes the agent directly (not erxes's prepareChatTurn
 * wrapper) — the agent is real + tool-bound, and memory persistence goes through
 * the native Mastra store.
 */
import type { Agent } from '@mastra/core/agent';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { studioModels, STUDIO_SUBDOMAIN } from './tenant';

/** Stable, route-safe key for the Studio agents map. */
function keyOf(cfg: { agentId?: string; _id: string }): string {
  return String(cfg.agentId || cfg._id).replace(/[^a-zA-Z0-9_-]/g, '_');
}

export async function buildStudioAgents(): Promise<Record<string, Agent>> {
  const agents: Record<string, Agent> = {};

  let models: Awaited<ReturnType<typeof studioModels>>;
  let configs: Array<{ _id: string; agentId?: string; name?: string }>;
  try {
    models = await studioModels();
    configs = await models.MastraAgent.getAgents();
  } catch (err) {
    console.error(
      '[erxes-studio] could not load agents from Mongo:',
      (err as Error).message,
    );
    return agents;
  }

  for (const cfg of configs) {
    try {
      const { agent } = await getOrCreateAgent(
        cfg as never,
        models,
        STUDIO_SUBDOMAIN,
      );
      agents[keyOf(cfg)] = agent;
      console.log(`[erxes-studio] registered: ${cfg.name} (${keyOf(cfg)})`);
    } catch (err) {
      console.error(
        `[erxes-studio] skipped ${cfg?.name ?? cfg?._id}: ${(err as Error).message}`,
      );
    }
  }

  console.log(
    `[erxes-studio] ${Object.keys(agents).length}/${configs.length} agents registered`,
  );
  return agents;
}
