import { Agent } from '@mastra/core/agent';
import type { ToolsInput } from '@mastra/core/agent';
import type { IModels } from '~/connectionResolvers';
import type { IMastraAgentDocument } from '@/agent/@types/agent';
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
import { resolveDestructiveOpsPolicy } from './tools/destructiveGuard';
import { writeAgentAction, AgentActionInput } from './auditLog';

// Cache agents by config ID + updatedAt + routing version.
const agentCache = new Map<string, Agent>();

// Also cache the raw tools map so the resolver can execute them directly
// when a model outputs function calls as plain text instead of tool_calls.
const toolsCache = new Map<string, ToolsInput>();

// Increment this whenever routing.ts, the meta-tools, or provider logic changes.
const ROUTING_VERSION = 25;

export interface AgentWithTools {
  agent: Agent;
  tools: ToolsInput;
}

/** Build (or return the cached) Mastra agent for a stored agent config. */
export async function getOrCreateAgent(
  agentConfig: IMastraAgentDocument,
  models: IModels,
): Promise<AgentWithTools> {
  const [providers, settings] = await Promise.all([
    models.MastraProvider.find({ isEnabled: true }),
    models.MastraSettings.getSettings(),
  ]);

  // The agent's reach: 'all' (every erxes operation + builtin) by default, or a
  // restricted allowlist. The two meta-tools enforce this at execution time.
  const policy = resolveToolPolicy(agentConfig);

  // Consent for irreversible deletes/merges. Defaults to 'block' (incl. legacy
  // agents with no field persisted) so the AI cannot remove data by mistake;
  // the execute meta-tool refuses destructive ops unless this is 'allow'.
  const destructiveOps = resolveDestructiveOpsPolicy(agentConfig);

  // The live, cached schema registry powers search + execute. No per-operation
  // tool docs are bound any more — capabilities are derived from the gateway.
  const registry = await getOperationRegistry(settings);

  // The installed-services inventory both grounds the system prompt AND keys
  // the cache: enabling/disabling a plugin changes the fingerprint, so the
  // agent (and its prompt) is rebuilt as soon as the registry refreshes.
  const inventory = capabilityInventory(registry.list, policy);

  const cacheKey = `${agentConfig._id}:${agentConfig.updatedAt?.getTime?.() ?? 0}:v${ROUTING_VERSION}:${inventory.fingerprint}`;

  const cached = agentCache.get(cacheKey);
  if (cached) {
    return {
      agent: cached,
      tools: toolsCache.get(cacheKey) ?? {},
    };
  }

  // Evict stale entries for this agent
  for (const key of agentCache.keys()) {
    if (key.startsWith(`${agentConfig._id}:`)) {
      agentCache.delete(key);
      toolsCache.delete(key);
    }
  }

  const model = buildModel(agentConfig.provider, agentConfig.model, providers);

  const tools: ToolsInput = {};
  const builtinInfos: ToolInfo[] = [];

  // erxes search/execute meta-tools — bound only when the policy grants at least
  // one operation (an all-builtins-only restricted agent skips them).
  // Per-agent audit sink: every mutation the agent runs (or is blocked from)
  // is recorded against this agent. Fire-and-forget inside writeAgentAction.
  const recordAction = (entry: AgentActionInput) =>
    writeAgentAction(models, {
      ...entry,
      source: 'chat',
      agentId: agentConfig.agentId,
    });

  const hasErxes = hasAnyOperation(registry.list, policy);
  if (hasErxes) {
    Object.assign(
      tools,
      buildErxesMetaTools({
        registry,
        settings,
        policy,
        destructiveOps,
        recordAction,
      }),
    );
  }

  // Standalone builtin tools, filtered by policy.
  for (const [key, tool] of Object.entries(BUILTIN_TOOLS)) {
    if (!isBuiltinAllowed(key, policy)) continue;
    tools[key] = tool;
    builtinInfos.push({
      id: key,
      name: key,
      description: tool.description,
    });
  }

  // read-attachment is bound regardless of policy: when the chat transport
  // accepts a file, the agent must always be able to open it. (It only reads
  // files from this instance's own storage — no external reach.)
  if (!tools.readAttachment) {
    const tool = BUILTIN_TOOLS.readAttachment;
    tools.readAttachment = tool;
    builtinInfos.push({
      id: 'readAttachment',
      name: 'readAttachment',
      description: tool.description,
    });
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

  // Workflow builds are 20+ steps (guide → searches → validate → simulate →
  // save → run). A cap of 32 is the floor for workflow-capable agents.
  // Pure chat/search/chart agents only ever need ~5 steps — use the configured
  // value with a floor of 8 so they don't waste LLM round-trips.
  const configuredSteps = agentConfig.maxSteps || 8;
  const hasWorkflowTools = toolNames.some((k) => k.startsWith('workflow'));
  const stepFloor = hasWorkflowTools ? 32 : 8;
  const maxSteps = toolNames.length
    ? Math.max(configuredSteps, stepFloor)
    : configuredSteps;

  // Configured sampling temperature. Unset → provider/SDK default (the legacy
  // loop hardcodes 0, which models like Kimi thinking — "only 1 is allowed" —
  // reject; setting it here lets the dashboard fix that per agent).
  const temperature = agentConfig.temperature;
  const hasTemperature = typeof temperature === 'number';

  const agent = new Agent({
    id: agentConfig.agentId,
    name: agentConfig.name,
    instructions: systemPrompt,
    model,
    tools: toolNames.length ? tools : undefined,
    // The modern loop (generate/stream) reads defaultOptions; the legacy
    // OpenAI-compatible loop (generateLegacy/streamLegacy) reads its own two
    // keys and otherwise falls back to Mastra's internal default — all three
    // must be set or legacy turns get silently truncated mid-task.
    defaultOptions: {
      maxSteps,
      ...(hasTemperature ? { modelSettings: { temperature } } : {}),
    },
    defaultGenerateOptionsLegacy: {
      maxSteps,
      ...(hasTemperature ? { temperature } : {}),
    },
    defaultStreamOptionsLegacy: {
      maxSteps,
      ...(hasTemperature ? { temperature } : {}),
    },
    // The two legacy keys are read at runtime but missing from Mastra's
    // published AgentConfig type, hence the cast.
  } as unknown as ConstructorParameters<typeof Agent>[0]) as unknown as Agent;

  agentCache.set(cacheKey, agent);
  toolsCache.set(cacheKey, tools);
  return { agent, tools };
}

/** Drop every cached agent built from the given stored config id. */
export function invalidateAgentCache(agentId: string) {
  for (const key of agentCache.keys()) {
    if (key.startsWith(`${agentId}:`)) {
      agentCache.delete(key);
      toolsCache.delete(key);
    }
  }
}
