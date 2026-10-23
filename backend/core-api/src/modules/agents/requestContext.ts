import type { RequestContext } from '@mastra/core/request-context' with {
  'resolution-mode': 'import',
};

import type { IAgentsThinkingLevel } from '@/agents/agent';
import type { AgentsApprovalMode } from '@/agents/@types/settings';
import type { IAgentsToolContext } from '@/agents/tools';

/**
 * The per-run selection carried by the agents chat runs on Mastra's
 * `RequestContext`.
 *
 * This is the durable agent's rehydration seam: when a run suspends
 * (destructive-tool approval or ask_user) the JSON-safe entries below are
 * serialized into the workflow snapshot, and a later resume — same process,
 * a later request, or another process after a restart — restores them and
 * re-runs the agent's dynamic model/instructions/tools callbacks against
 * them. The callbacks then re-fetch the acting user's CURRENT BYOK
 * credentials server-side from `subdomain`/`userId`/`provider`/`model`.
 *
 * Because of that, ONLY non-secret, JSON-safe selection fields may ever be
 * stamped here: never an API key, an auth header, a connection config
 * object, or a live model instance — anything stamped rides into the
 * persistent snapshot storage.
 */
/**
 * One navigable page the client reports it can open — validated and
 * stamped per run so the `findPages` tool works identically on resume.
 */
export interface IAgentsNavigationEntry {
  path: string;
  label: string;
  group?: string;
}

export interface IAgentsRequestContext extends IAgentsToolContext {
  /** The BYOK provider the turn was resolved to. */
  provider: string;
  /** The model the turn runs on (per-turn override or the stored model). */
  model: string;
  /** Thinking depth picked in the chat UI for this turn. */
  thinkingLevel: IAgentsThinkingLevel;
  /** Whether the tenant's sandboxed code-mode tool rides along. */
  codeModeEnabled: boolean;
  /** Tenant approval policy for this run — 'writes' holds every mutation. */
  approvalMode: AgentsApprovalMode;
  /** Current thread id; used to scope readFile to conversation attachments. */
  threadId?: string;
  /** Attachment urls from this turn. readFile refuses other locations. */
  attachmentUrls?: string[];
  /** The client's navigable page catalog for this run (`findPages`). */
  navigation?: IAgentsNavigationEntry[];
}

export type IAgentsRequestContextInstance = RequestContext<IAgentsRequestContext>;

/**
 * Stamps the acting user's identity plus the exact, already-validated run
 * selection into a fresh `RequestContext`. Identity always comes from the
 * gateway headers (resolved by the caller), never from the request body.
 */
export const buildAgentsRequestContext = async (
  values: IAgentsRequestContext,
): Promise<IAgentsRequestContextInstance> => {
  // @mastra/core/request-context is ESM-only; load it dynamically from
  // CommonJS like the other Mastra entries.
  const { RequestContext: RequestContextCtor } = await import(
    '@mastra/core/request-context'
  );

  const requestContext =
    new RequestContextCtor<IAgentsRequestContext>();

  requestContext.set('subdomain', values.subdomain);
  requestContext.set('userId', values.userId);
  requestContext.set('provider', values.provider);
  requestContext.set('model', values.model);
  requestContext.set('thinkingLevel', values.thinkingLevel);
  requestContext.set('codeModeEnabled', values.codeModeEnabled);
  requestContext.set('approvalMode', values.approvalMode);
  if (values.threadId) {
    requestContext.set('threadId', values.threadId);
  }
  if (values.attachmentUrls) {
    requestContext.set('attachmentUrls', values.attachmentUrls);
  }
  if (values.navigation) {
    requestContext.set('navigation', values.navigation);
  }

  return requestContext;
};
