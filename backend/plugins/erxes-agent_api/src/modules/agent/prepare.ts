import { IUserDocument } from 'erxes-api-shared/core-types';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getOrCreateAgent } from '~/mastra/agentRuntime';
import { isAdvancedMemoryEnabled } from '~/mastra/memory/config';
import { scopedResource, getMastraMemory } from '~/mastra/memory/mastraMemory';
import { deriveResourceId, augmentConvo, MemoryContext } from '~/mastra/memory';
import { readLearnedDigest } from '~/mastra/learning/digest';
import { ApprovedOp } from '~/mastra/requestContext';
import { buildChatUserContent } from '~/mastra/files/chatContent';
import { IMastraChatAttachment } from '@/session/@types/session';
import { ensureThreadRegistered } from '@/session/nativeStore';
import {
  PreparedTurn,
  TurnAgent,
  TurnIdentity,
  TurnMessage,
} from '@/agent/types';

// Turn setup: everything a chat turn needs before the model runs — agent +
// tools, thread ownership check, replayed history, advanced-memory blocks, and
// the auth context tools execute under. One spine shared by all four callers
// (in-app chat, the GraphQL resolver, the frontline bot webhook, scheduled
// runs); `identity` (see TurnIdentity) is the single knob that varies — it
// decides resource scoping, auth, ownership gating, and the memory toggle.
// Throws user-facing errors on bad agent/thread.

// Per-identity resource id, the memory toggle, and the auth context. Pure
// (no I/O) so the spine reads as straight-line logic.
function resolveIdentity(
  identity: TurnIdentity,
  agentId: string,
  advanced: boolean,
  message: string,
): { resourceId: string; useMemory: boolean; userHeader?: string } {
  switch (identity.kind) {
    case 'user':
      return {
        resourceId: deriveResourceId({ user: identity.user, agentId }),
        // Advanced memory rides on the agent's own history toggle.
        useMemory: advanced,
        userHeader: identity.user
          ? Buffer.from(JSON.stringify(identity.user)).toString('base64')
          : undefined,
      };
    case 'bot':
      return {
        resourceId: identity.resourceKey,
        // The bot only persists/recalls when there is a real user message.
        useMemory: advanced && Boolean(message.trim()),
      };
    case 'schedule':
      return {
        resourceId: identity.resourceKey,
        useMemory: advanced,
      };
  }
}

export interface PrepareTurnParams {
  models: IModels;
  subdomain: string;
  identity: TurnIdentity;
  agentId: string;
  message: string;
  threadId?: string;
  attachments?: IMastraChatAttachment[];
  approvedOperations?: ApprovedOp[];
  // Weave the tenant's learned digest into the convo (and stamp its ids onto
  // the turn). On for chat/bot; off for scheduled runs (whose prompt is run
  // verbatim, the pre-generalization behaviour).
  weaveDigest?: boolean;
}

export async function prepareTurn(
  params: PrepareTurnParams,
): Promise<PreparedTurn> {
  const {
    models,
    subdomain,
    identity,
    agentId,
    message,
    threadId,
    attachments,
    approvedOperations,
    weaveDigest = true,
  } = params;

  // Same NoSQL-injection guard as sessionId below: agentId arrives from the
  // request body, so a crafted object must never reach a Mongo query.
  if (typeof agentId !== 'string' || !agentId) {
    throw new ExpectedError('agentId must be a non-empty string');
  }

  const agentConfig = await models.MastraAgent.findOne({
    agentId,
    isEnabled: true,
  });
  if (!agentConfig)
    throw new ExpectedError(`Agent "${agentId}" not found or disabled`);

  const settings = await models.MastraSettings.findOne({});
  const providers = await models.MastraProvider.find({ isEnabled: true });
  const { agent, tools } = await getOrCreateAgent(
    agentConfig,
    models,
    subdomain,
  );

  // Stable session id — the persisted thread this turn belongs to.
  // typeof guard keeps crafted non-string payloads out of Mongo queries
  // (NoSQL injection via query operators).
  const sessionId =
    typeof threadId === 'string' && threadId ? threadId : `chat-${Date.now()}`;

  const useHistory = agentConfig.memoryEnabled !== false;
  // Advanced memory rides on the agent's own memory toggle.
  const advanced = isAdvancedMemoryEnabled() && useHistory;

  const { resourceId, useMemory, userHeader } = resolveIdentity(
    identity,
    agentId,
    advanced,
    message,
  );

  const memCtx: MemoryContext = {
    subdomain,
    resourceId,
    threadId: sessionId,
    agentId,
  };

  // Mastra Memory (attached to the agent in getOrCreateAgent) is the ONLY chat
  // store: it persists the turn, replays recent history, and runs semantic
  // recall + working memory via the per-turn binding below. An unknown tenant
  // does NOT skip persistence — scopedResource defaults an empty subdomain to
  // the "os" scope so the thread is still persisted and listable.
  const memoryBinding = useMemory
    ? { thread: sessionId, resource: scopedResource(subdomain, resourceId) }
    : undefined;

  // Ownership gate: a CONTINUED thread must belong to this caller. getThreadById
  // without a resource returns the thread whatever its owner; if it exists under
  // a different resource it is someone else's session — reported as "not found"
  // (no existence leak). Only in-app users own threads; bot/schedule resources
  // are synthetic and self-scoped, so the gate is a no-op for them.
  if (
    identity.kind === 'user' &&
    memoryBinding &&
    typeof threadId === 'string' &&
    threadId
  ) {
    const memory = await getMastraMemory(subdomain);
    const existing = (await memory.getThreadById({
      threadId: sessionId,
    } as never)) as { resourceId?: string } | null;
    if (existing && existing.resourceId !== memoryBinding.resource) {
      throw new ExpectedError('Thread not found');
    }
  }

  // Register the thread + its agent binding NOW, before the model streams, so
  // the session is listable the moment the turn starts — not only after it
  // finishes. This is what lets a refresh WHILE the agent is still running keep
  // the session: the sidebar query (listOwnedThreads → metadata.agentId) finds
  // it, and reopening it hydrates the persisted turn. patchNativeTurn re-stamps
  // the same binding at turn-end. In-app chat only (bot/schedule threads are not
  // user-listable, and their binding stamp at turn-end suffices). Best-effort:
  // never block the turn on a store hiccup (the end-of-turn stamp is the
  // backstop).
  if (identity.kind === 'user' && memoryBinding) {
    await ensureThreadRegistered(
      subdomain,
      sessionId,
      memoryBinding.resource,
      agentId,
    ).catch((e) =>
      console.warn(
        `[native-chat-store] thread pre-register skipped: ${
          (e as Error)?.message || e
        }`,
      ),
    );
  }

  // The tenant's learned digest (shared "Agent knowledge") is woven into the
  // turn — separate from Mastra Memory. Best-effort: null on error. Skipped for
  // scheduled runs (weaveDigest=false), whose prompt is run verbatim.
  const digest = weaveDigest
    ? await readLearnedDigest(models, agentId)
    : null;

  // Mastra Memory replays recent history + recall itself, so generate() gets
  // ONLY the new user message (+ the learned digest). Passing replayed history
  // here would stop Mastra from persisting the turn to its store.
  const convo: TurnMessage[] = augmentConvo({
    recentHistory: [],
    userMessage: message,
    recallBlock: null,
    workingMemoryBlock: null,
    learnedDigestBlock: digest?.block,
  });

  // Attachments reshape the final user turn: manifest text + inlined image
  // parts. The persisted message keeps the raw text; only the LLM convo is
  // augmented. (augmentConvo always places the user message last.)
  if (attachments?.length) {
    const content = await buildChatUserContent({
      message,
      attachments,
      erxesApiUrl: settings?.erxesApiUrl || 'http://localhost:4000',
    });
    convo[convo.length - 1] = { role: 'user', content };
  }

  const authCtx = {
    userHeader,
    token: settings?.erxesApiToken,
    subdomain,
    approvedOps: approvedOperations,
  };

  return {
    agentConfig,
    settings,
    providers,
    // The published Agent generics type tool results as wire chunks; the
    // runtime objects this pipeline reads are the duck-typed shapes in
    // ToolResultLike, hence the structural cast (cf. titler.ts).
    agent: agent as unknown as TurnAgent,
    tools,
    sessionId,
    convo,
    authCtx,
    advanced,
    useMemory,
    memoryBinding,
    memCtx,
    attachments,
    learningIds: digest?.ids ?? [],
  };
}

// Thin wrapper for the in-app chat path (SSE route + mastraAgentChat resolver),
// kept so those callers stay stable. Delegates to the generalized prepareTurn.
export async function prepareChatTurn(params: {
  models: IModels;
  subdomain: string;
  user: IUserDocument;
  agentId: string;
  message: string;
  threadId?: string;
  attachments?: IMastraChatAttachment[];
  approvedOperations?: ApprovedOp[];
}): Promise<PreparedTurn> {
  const { user, ...rest } = params;
  return prepareTurn({ ...rest, identity: { kind: 'user', user } });
}
