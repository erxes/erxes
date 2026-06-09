import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { getBuiltinTool } from './tools/builtins';
import { buildErxesTool, fetchInputTypesMap } from './tools/erxesTools';
import { buildModel } from './providers';
import { buildSystemPrompt } from './instructions/routing';

// Cache agents by config ID + updatedAt + routing version.
const agentCache = new Map<string, Agent>();

// Also cache the raw tools map so the resolver can execute them directly
// when a model outputs function calls as plain text instead of tool_calls.
const toolsCache = new Map<string, Record<string, any>>();

// Increment this whenever routing.ts, erxesTools.ts, or provider logic changes.
const ROUTING_VERSION = 9;

export interface AgentWithTools {
  agent: Agent;
  tools: Record<string, any>;
}

export async function getOrCreateAgent(agentConfig: any, models: any): Promise<AgentWithTools> {
  const cacheKey = `${agentConfig._id}:${agentConfig.updatedAt?.getTime?.() ?? 0}:v${ROUTING_VERSION}`;

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

  const [providers, settings] = await Promise.all([
    models.MastraProvider.find({ isEnabled: true }),
    models.MastraSettings.getSettings(),
  ]);

  const model = buildModel(agentConfig.provider, agentConfig.model, providers);

  // Fetch INPUT_OBJECT field definitions once per agent build so every erxes tool
  // gets a real Zod schema for complex input types (e.g. AttachmentInput).
  const inputTypesMap = await fetchInputTypesMap(settings);

  const tools: Record<string, any> = {};
  for (const toolId of (agentConfig.toolIds || [])) {
    const toolConfig = await models.MastraTool.findOne({ toolId, isEnabled: true });
    if (!toolConfig) continue;

    if (toolConfig.type === 'builtin') {
      const tool = getBuiltinTool(toolConfig.builtinType);
      if (tool) tools[toolId] = tool;
    } else if (toolConfig.type === 'erxes') {
      const tool = buildErxesTool(toolConfig, settings, inputTypesMap);
      if (tool) tools[toolId] = tool;
    }
  }

  let memory: Memory | undefined;
  if (agentConfig.memoryEnabled) {
    const dbPath = settings?.memoryDbPath || 'file:./mastra-memory.db';
    memory = new Memory({
      storage: new LibSQLStore({ id: 'mastra-memory', url: dbPath }),
    });
  }

  const toolNames = Object.keys(tools);
  const systemPrompt = buildSystemPrompt(agentConfig.instructions || '', toolNames);

  const agent = new Agent({
    id: agentConfig.agentId,
    name: agentConfig.name,
    instructions: systemPrompt,
    model,
    tools: toolNames.length ? tools : undefined,
    memory,
    defaultOptions: { maxSteps: agentConfig.maxSteps || 3 },
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
