import { z } from 'zod';
import type { Tool } from '@mastra/core/tools' with {
  'resolution-mode': 'import',
};
import {
  callAgentTool,
  listAgentToolManifests,
  type IAgentToolDescriptor,
} from './agentTools';
import {
  applyAgentToolContract,
  validateAgentToolInput,
} from './toolContracts';
import { extractAgentReferences } from './references';
import type { AgentsApprovalMode } from '@/agents/@types/settings';

/**
 * Two-tier Mastra tool bridge for the agents module.
 *
 * The platform can expose dozens of agent tools, most with minimal (or null)
 * schema metadata, so we never inject them all into the model at once. Instead
 * the model sees exactly two tools:
 *
 * - `searchTools(intent)` — returns ranked tool descriptors so the model can
 *   discover a valid `toolId` for what the user wants.
 * - `callTool(toolId, input)` — executes one tool as the acting user. The
 *   owning service enforces permissions. A tool that requires approval
 *   (destructive, or on the always-confirm list) is gated by Mastra's
 *   built-in `requireApproval` hook: the run suspends before anything runs
 *   and only executes once the human approves that specific call via
 *   `approveToolCall` (or declines it via `declineToolCall`).
 *
 * The acting user (subdomain + userId) is read from the Mastra `RequestContext`
 * that the route stamps into `agent.stream(...)`, so a tool never trusts
 * model-provided identity.
 */

/** Request-scoped identity stamped before `agent.stream(...)`. */
export interface IAgentsToolContext {
  subdomain: string;
  userId: string;
}

/** Manifests are cached per subdomain; matches the platform's 60s cache. */
const MANIFEST_CACHE_TTL_MS = 60_000;

/**
 * Tool ids that always require human confirmation even when the platform
 * manifest does not flag them as destructive. Some mutations are declared
 * with `.query()` in their owning plugin (so `destructive` stays false) yet
 * still change state; they are listed here explicitly. Settings-driven
 * curation of this list is a later phase; the plugin owns the constant for
 * now.
 */
const ALWAYS_CONFIRM_TOOLS = new Set<string>([
  // Declared as a query in the frontline plugin's inbox router but mutates
  // conversation state. Tool ids are `${plugin}.trpc.${path}`; the procedure
  // currently carries no `.meta({ agent })`, so it is not in the manifest
  // today — the entry stays correct for the day it is annotated.
  'frontline.trpc.inbox.conversations.changeStatus',
]);

/**
 * Path-segment names treated as high-risk when the tenant opts into
 * `'destructive'` mode: deletes, merges, and customer-facing sends —
 * plain creates/updates then run without asking.
 */
export const HIGH_RISK_ACTION =
  /(remove|delete|merge|destroy|archive|purge|send|reply|broadcast|publish)/i;

const lastPathSegment = (path: string | undefined): string => {
  const tail = (path ?? '').split('.').pop();

  return tail ?? '';
};

export const requiresApproval = (
  descriptor: IAgentToolDescriptor,
  mode: AgentsApprovalMode = 'writes',
): boolean => {
  if (ALWAYS_CONFIRM_TOOLS.has(descriptor.id)) {
    return true;
  }

  if (mode === 'destructive') {
    // Name-based high-risk list only — the shared manifest marks EVERY
    // mutation `destructive`, which would make the two modes identical.
    return HIGH_RISK_ACTION.test(lastPathSegment(descriptor.path));
  }

  return descriptor.method === 'mutation' || descriptor.destructive;
};

interface IToolCacheEntry {
  tools: IAgentToolDescriptor[];
  fetchedAt: number;
}

const manifestCache = new Map<string, IToolCacheEntry>();

const getCachedTools = async (
  subdomain: string,
): Promise<IAgentToolDescriptor[]> => {
  const now = Date.now();
  const cached = manifestCache.get(subdomain);

  if (cached && now - cached.fetchedAt < MANIFEST_CACHE_TTL_MS) {
    return cached.tools;
  }

  const { manifests } = await listAgentToolManifests(subdomain);
  const tools = manifests.flatMap((manifest) => manifest.tools);

  manifestCache.set(subdomain, { tools, fetchedAt: now });

  return tools;
};

export const findAgentToolDescriptor = async (
  subdomain: string,
  toolId: string,
): Promise<IAgentToolDescriptor | undefined> => {
  const tools = await getCachedTools(subdomain);

  return tools.find((tool) => tool.id === toolId);
};

/**
 * Whether a tool id requires human approval — destructive per the manifest,
 * or on the always-confirm list. Shared by callTool's `requireApproval`
 * predicate and the code-mode safe-call wrapper: sandboxed programs call
 * tool `execute` directly, so Mastra's approval suspension never runs there
 * and the wrapper must refuse gated ids itself.
 */
export const isGatedAgentToolCall = async (
  subdomain: string,
  toolId: string,
  mode: AgentsApprovalMode = 'writes',
): Promise<boolean> => {
  const descriptor = await findAgentToolDescriptor(subdomain, toolId);

  return descriptor ? requiresApproval(descriptor, mode) : false;
};

/**
 * Reads the approval mode stamped on the run's RequestContext. Missing
 * (pre-feature snapshots, code paths without the stamp) resolves to
 * 'destructive' — the historical behavior — rather than failing closed on
 * every tool call.
 */
export const readApprovalMode = (
  context: {
    requestContext?: { get?(key: string): unknown } | Record<string, unknown>;
  } | undefined,
): AgentsApprovalMode => {
  const rc = context?.requestContext as
    | ({ get?(key: string): unknown } & Record<string, unknown>)
    | undefined;

  const value = typeof rc?.get === 'function' ? rc.get('approvalMode') : rc?.approvalMode;

  // Missing (pre-feature snapshots) or unknown → fail safe into 'writes'.
  return value === 'writes' || value === 'destructive' ? value : 'writes';
};

export const readIdentity = (context: {
  requestContext: { get(key: string): unknown };
}): { subdomain: string; userId: string } => {
  const subdomain = context.requestContext.get('subdomain');
  const userId = context.requestContext.get('userId');

  if (typeof subdomain !== 'string' || typeof userId !== 'string') {
    throw new Error('Agents tool request context is incomplete.');
  }

  return { subdomain, userId };
};

/** Simple term-overlap ranking against the tool's searchable metadata. */
const rankByIntent = (
  tools: IAgentToolDescriptor[],
  intent: string,
): IAgentToolDescriptor[] => {
  const terms = intent.toLowerCase().split(/\s+/).filter(Boolean);

  const scored = tools.map((tool) => {
    const haystack =
      `${tool.plugin} ${tool.module} ${tool.path} ${tool.description ?? ''}`
        .toLowerCase();
    let score = 0;

    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 1;
      }
    }

    return { tool, score };
  });

  return scored
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.tool);
};

/** Render a platform error (403 denial, 413 too-large, etc.) as tool output. */
export const toToolFailure = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    const err = error as Error & {
      code?: string;
      statusCode?: number;
      suggestion?: string;
    };

    return {
      status: 'error',
      error: err.message || 'Tool call failed.',
      code: err.code ?? 'SERVER_ERROR',
      ...(typeof err.statusCode === 'number'
        ? { httpStatus: err.statusCode }
        : {}),
      ...(err.suggestion ? { suggestion: err.suggestion } : {}),
    };
  }

  return { status: 'error', error: 'Tool call failed.' };
};

type MastraTool = Tool;

// @mastra/core/tools is ESM-only under nodenext; load it dynamically (like the
// other Mastra entries) and build the two tools once per process.
let toolsPromise:
  | Promise<{ searchTools: MastraTool; callTool: MastraTool }>
  | null = null;

export const buildAgentsTools =
  async (): Promise<{ searchTools: MastraTool; callTool: MastraTool }> => {
    if (!toolsPromise) {
      toolsPromise = import('@mastra/core/tools').then(({ createTool }) => ({
        searchTools: createTool({
          id: 'searchTools',
          description:
            "Search the erxes XOS for agent-callable tools (read queries and mutating actions) relevant to what the user wants. Pass a short intent describing the goal; returns ranked tool descriptors with id, plugin, description, destructive flag and input shape. Call this before callTool to learn valid toolIds (for example 'sales.trpc.deal.count').",
          inputSchema: z.object({
            intent: z
              .string()
              .describe('What the user wants to accomplish, in a few words'),
            maxResults: z
              .number()
              .int()
              .min(1)
              .max(20)
              .optional()
              .describe('Maximum number of descriptors to return (default 10)'),
          }),
          execute: async ({ intent, maxResults }, context) => {
            const { subdomain } = readIdentity(context);
            const tools = await getCachedTools(subdomain);
            const matches = rankByIntent(tools, intent);
            const ranked = matches.slice(0, maxResults ?? 10);

            return {
              matched: matches.length,
              tools: ranked.map(applyAgentToolContract),
            };
          },
        }),
        callTool: createTool({
          id: 'callTool',
          description:
            "Execute an erxes XOS tool previously discovered with searchTools. Provide its toolId and the input object matching that tool's schema. Tools that require approval (destructive Remove/Delete/Merge actions, or tools on the always-confirm list) are held for the human user to approve before anything runs. If you lack permission, or the response exceeds the size limit, the platform returns a readable explanation — relay it to the user and suggest a narrower query.",
          inputSchema: z.object({
            toolId: z
              .string()
              .describe(
                'Tool id discovered with searchTools, e.g. sales.trpc.deal.count',
              ),
            input: z
              .record(z.string(), z.unknown())
              .optional()
              .describe(
                'Arguments for the tool; omit for count/findOne with no args',
              ),
          }),
          // Mastra's built-in approval gate, evaluated per call with the
          // parsed input and the request context. Returning true suspends the
          // run before `execute` runs; the human then approves or declines the
          // specific tool call via `approveToolCall`/`declineToolCall`. Each
          // tool call gets its own decision, so a resumed run that later calls
          // another approval-gated tool suspends again on its own.
          requireApproval: async (input, ctx) => {
            const subdomain = ctx?.requestContext?.subdomain;
            const toolId = input?.toolId;

            if (typeof subdomain !== 'string' || typeof toolId !== 'string') {
              return false;
            }

            return isGatedAgentToolCall(
              subdomain,
              toolId,
              readApprovalMode(ctx),
            );
          },
          execute: async ({ toolId, input }, context) => {
            const { subdomain, userId } = readIdentity(context);

            try {
              const result = await callAgentTool({
                subdomain,
                userId,
                toolId,
                input: validateAgentToolInput(toolId, input),
              });
              const references = extractAgentReferences(toolId, result);

              return {
                status: 'ok',
                result,
                ...(references.length ? { references } : {}),
              };
            } catch (error) {
              return toToolFailure(error);
            }
          },
        }),
      }));
    }

    return toolsPromise;
  };
