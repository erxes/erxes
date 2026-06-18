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
import { PreparedTurn, TurnAgent, TurnMessage } from '@/agent/types';

// Turn setup: everything a chat turn needs before the model runs — agent +
// tools, thread ownership check, replayed history, advanced-memory blocks, and
// the auth context tools execute under. Throws user-facing errors on bad
// agent/thread.
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
  const {
    models,
    subdomain,
    user,
    agentId,
    message,
    threadId,
    attachments,
    approvedOperations,
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

  const memCtx: MemoryContext = {
    subdomain,
    resourceId: deriveResourceId({ user, agentId }),
    threadId: sessionId,
    agentId,
  };

  // Mastra Memory (attached to the agent in getOrCreateAgent) is the ONLY chat
  // store: it persists the turn, replays recent history, and runs semantic
  // recall + working memory via the per-turn binding below. Active whenever
  // advanced memory is on. An unknown tenant does NOT skip persistence — it
  // would silently drop the turn and lose the session; scopedResource defaults
  // an empty subdomain to the "os" scope so the thread is still persisted and
  // listable.
  const useMemory = advanced;
  const memoryBinding = useMemory
    ? {
        thread: sessionId,
        resource: scopedResource(subdomain, memCtx.resourceId),
      }
    : undefined;

  // Ownership gate: a CONTINUED thread must belong to this user. getThreadById
  // without a resource returns the thread whatever its owner; if it exists under
  // a different resource it is someone else's session — reported as "not found"
  // (no existence leak). A fresh sessionId simply doesn't exist yet.
  if (memoryBinding && typeof threadId === 'string' && threadId) {
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
  // the same binding at turn-end. Best-effort: never block the turn on a store
  // hiccup (the end-of-turn stamp is the backstop).
  if (memoryBinding) {
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
  // turn — separate from Mastra Memory. Best-effort: null on error.
  const digest = await readLearnedDigest(models, agentId);

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

  const userHeader = user
    ? Buffer.from(JSON.stringify(user)).toString('base64')
    : undefined;
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
