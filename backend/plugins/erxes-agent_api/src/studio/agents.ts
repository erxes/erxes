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
import { getMastraMemory } from '~/mastra/memory/mastraMemory';
import { studioModels, STUDIO_SUBDOMAIN } from './tenant';
import { pinResource, detectDevResource } from './pinnedMemory';

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

  // Pin Studio's agent memory to the dashboard's resource bucket so Studio and
  // the erxes dashboard share ONE conversation history (same native store, same
  // resourceId) instead of living on separate scopes.
  let pinned: Awaited<ReturnType<typeof getMastraMemory>> | null = null;
  try {
    const devResource = await detectDevResource(STUDIO_SUBDOMAIN);
    if (devResource) {
      pinned = pinResource(await getMastraMemory(STUDIO_SUBDOMAIN), devResource);
      console.log(
        `[erxes-studio] memory pinned to dashboard resource: ${devResource}`,
      );
    } else {
      console.log(
        '[erxes-studio] no dashboard resource found yet — Studio uses its own scope until the dashboard has chats',
      );
    }
  } catch (err) {
    console.error(
      `[erxes-studio] resource pin skipped: ${(err as Error).message}`,
    );
  }

  for (const cfg of configs) {
    try {
      const { agent } = await getOrCreateAgent(
        cfg as never,
        models,
        STUDIO_SUBDOMAIN,
      );
      // Override the agent's memory with the resource-pinned facade so its
      // chat + history-tab reads/writes land in the dashboard's bucket.
      // `__setMemory` is Mastra's internal memory setter — fine for this
      // dev-only bridge (it never ships in the production build), but guarded:
      // if a future Mastra renames/removes it, Studio still boots, just
      // unpinned (its own resource scope) instead of crashing.
      const setMemory = (agent as unknown as { __setMemory?: (m: unknown) => void })
        .__setMemory;
      if (pinned && typeof setMemory === 'function') {
        setMemory.call(agent, pinned);
      } else if (pinned) {
        console.warn(
          '[erxes-studio] agent.__setMemory unavailable — Studio history runs unpinned (its own scope)',
        );
      }
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
