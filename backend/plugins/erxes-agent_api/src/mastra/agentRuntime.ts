import { Agent } from '@mastra/core/agent';
import { BUILTIN_TOOLS } from './tools/builtins';
import { buildModel } from './providers';
import { buildSystemPrompt, ToolInfo } from './instructions/routing';
import { getOperationRegistry } from './tools/operationRegistry';
import { buildErxesMetaTools } from './tools/metaTools';
import {
  resolveToolPolicy,
  isBuiltinAllowed,
  hasAnyOperation,
  scopeSummary,
  capabilityInventory,
} from './tools/scope';

// Cache agents by config ID + updatedAt + routing version.
const agentCache = new Map<string, Agent>();

// Also cache the raw tools map so the resolver can execute them directly
// when a model outputs function calls as plain text instead of tool_calls.
const toolsCache = new Map<string, Record<string, any>>();

// Increment this whenever routing.ts, the meta-tools, or provider logic changes.
const ROUTING_VERSION = 14;

export interface AgentWithTools {
  agent: Agent;
  tools: Record<string, any>;
}

export async function getOrCreateAgent(agentConfig: any, models: any): Promise<AgentWithTools> {
  const [providers, settings] = await Promise.all([
    models.MastraProvider.find({ isEnabled: true }),
    models.MastraSettings.getSettings(),
  ]);

  // The agent's reach: 'all' (every erxes operation + builtin) by default, or a
  // restricted allowlist. The two meta-tools enforce this at execution time.
  const policy = resolveToolPolicy(agentConfig);

  // The live, cached schema registry powers search + execute. No per-operation
  // tool docs are bound any more — capabilities are derived from the gateway.
  const registry = await getOperationRegistry(settings);

  // The installed-services inventory both grounds the system prompt AND keys
  // the cache: enabling/disabling a plugin changes the fingerprint, so the
  // agent (and its prompt) is rebuilt as soon as the registry refreshes.
  const inventory = capabilityInventory(registry.list, policy);

  const cacheKey = `${agentConfig._id}:${agentConfig.updatedAt?.getTime?.() ?? 0}:v${ROUTING_VERSION}:${inventory.fingerprint}`;

  if (agentCache.has(cacheKey)) {
    return { agent: agentCache.get(cacheKey)!, tools: toolsCache.get(cacheKey) ?? {} };
  }

  // Evict stale entries for this agent
  for (const key of agentCache.keys()) {
    if (key.startsWith(`${agentConfig._id}:`)) {
      agentCache.delete(key);
      toolsCache.delete(key);
    }
  }

  const model = buildModel(agentConfig.provider, agentConfig.model, providers);

  const tools: Record<string, any> = {};
  const builtinInfos: ToolInfo[] = [];

  // erxes search/execute meta-tools — bound only when the policy grants at least
  // one operation (an all-builtins-only restricted agent skips them).
  const hasErxes = hasAnyOperation(registry.list, policy);
  if (hasErxes) {
    Object.assign(tools, buildErxesMetaTools({ registry, settings, policy }));
  }

  // Standalone builtin tools, filtered by policy.
  for (const [key, tool] of Object.entries(BUILTIN_TOOLS)) {
    if (!isBuiltinAllowed(key, policy)) continue;
    tools[key] = tool;
    builtinInfos.push({ id: key, name: key, description: (tool as any)?.description });
  }

  // Conversation memory is persisted in MongoDB (MastraThread / MastraMessage)
  // and replayed into each request as message history — see mastraAgentChat.
  // The agent itself is therefore stateless (no Mastra/LibSQL memory store).
  const toolNames = Object.keys(tools);
  const systemPrompt = buildSystemPrompt(agentConfig.instructions || '', {
    hasErxesTools: hasErxes,
    scopeLine: scopeSummary(policy),
    inventoryLines: inventory.lines,
    builtins: builtinInfos,
  });

  const agent = new Agent({
    id: agentConfig.agentId,
    name: agentConfig.name,
    instructions: systemPrompt,
    model,
    tools: toolNames.length ? tools : undefined,
    // search → execute → answer needs several steps; default generously.
    defaultOptions: { maxSteps: agentConfig.maxSteps || 8 },
  });

  agentCache.set(cacheKey, agent);
  toolsCache.set(cacheKey, tools);
  return { agent, tools };
}

export function invalidateAgentCache(agentId: string) {
  for (const key of agentCache.keys()) {
    if (key.startsWith(`${agentId}:`)) {
      agentCache.delete(key);
      toolsCache.delete(key);
    }
  }
}
