import { IModels } from '~/connectionResolvers';
import { getMastraMemory } from '~/mastra/memory/mastraMemory';
import { getThreadTitle } from '@/session/nativeStore';
import {
  IMastraChatAttachment,
  IMastraMessageMeta,
} from '@/session/@types/session';
import { MemoryBinding, PreparedTurn } from '@/agent/types';

// Persistence: mirror the completed exchange into the native chat store and
// recover the native assistant message id the client rates. Mastra Memory has
// already persisted the [user, assistant] pair during generate()/stream() — the
// work here is enriching that record with erxes-only turn artifacts.

// Persist the completed exchange so the session survives reloads, then index
// it into long-term memory (best-effort). Assistant `meta` carries thinking /
// tool-call artifacts for the chat UI.
//
// Returns `titlePromise`: the conversation auto-titler kicked off in the
// background (resolves to the new title or null). The SSE route awaits it
// briefly after `done` to push the title to the client; other callers can
// ignore it — it self-persists.
export async function persistTurn(params: {
  models: IModels;
  prepared: PreparedTurn;
  message: string;
  reply: string | null;
  meta?: IMastraMessageMeta;
}): Promise<{
  titlePromise: Promise<string | null>;
  // Persisted assistant message id — sent to the client so the reply can be
  // rated (thumbs feedback) without a reload.
  assistantMessageId: string | null;
}> {
  const { prepared, reply, meta } = params;
  const { useMemory, memCtx, agentConfig, attachments } = prepared;

  // Stamp which learnings were in context so a later thumbs rating can be
  // attributed to them (mastraMessageFeedback reads this back).
  const fullMeta: IMastraMessageMeta | undefined = prepared.learningIds?.length
    ? { ...(meta ?? {}), learningIdsInContext: prepared.learningIds }
    : meta;

  // Mastra Memory already persisted the [user, assistant] turn during
  // generate()/stream() — there is no custom store. The title is owned by
  // Mastra's native generateTitle (it sets thread.title once, while empty);
  // read it back so the SSE route can push it to the client.
  const titlePromise: Promise<string | null> =
    reply && prepared.memoryBinding
      ? getThreadTitle(
          memCtx.subdomain,
          prepared.memoryBinding.thread,
          prepared.memoryBinding.resource,
        ).catch(() => null)
      : Promise.resolve<string | null>(null);

  // Enrich the native records with the erxes-only turn artifacts and recover
  // the NATIVE assistant message id — that is what the client rates (feedback
  // resolves the native id). Best-effort: a patch failure never affects the
  // reply.
  let nativeAssistantId: string | null = null;
  if (useMemory && prepared.memoryBinding) {
    try {
      nativeAssistantId = await patchNativeTurn({
        subdomain: memCtx.subdomain,
        binding: prepared.memoryBinding,
        agentId: agentConfig.agentId,
        reply,
        meta: fullMeta,
        attachments,
      });
    } catch (e) {
      console.warn(
        `[native-chat-store] turn patch skipped: ${(e as Error)?.message || e}`,
      );
    }
  }

  return { titlePromise, assistantMessageId: nativeAssistantId };
}

// ─── Native chat store mirror (Phase 2) ─────────────────────────────────────

// The minimal native-message shape the metadata patch reads: the id to target
// and the V2 `content` blob it merges erxes fields into. (Mastra's full
// MastraDBMessage is wider; we only touch these.)
interface NativeChatMessage {
  id: string;
  role: string;
  content?: { metadata?: Record<string, unknown> } & Record<string, unknown>;
}

// Merge an erxes field blob into a native message's content under a namespaced
// `metadata.erxes` key — namespaced so it never collides with Mastra's own
// content.metadata keys — preserving the rest of the V2 content untouched.
function mergeErxesMeta(
  content: NativeChatMessage['content'],
  erxes: Record<string, unknown>,
): Record<string, unknown> {
  const base = (content ?? {}) as Record<string, unknown>;
  const metadata = (base.metadata ?? {}) as Record<string, unknown>;
  const prevErxes = (metadata.erxes ?? {}) as Record<string, unknown>;
  return {
    ...base,
    metadata: { ...metadata, erxes: { ...prevErxes, ...erxes } },
  };
}

// Mirror erxes-only turn fields onto Mastra's natively-persisted turn so the
// native store can later become the chat read source (docs/NATIVE-CHAT-STORE.md,
// Phase 2). Mastra already persisted the [user, assistant] pair during
// generate()/stream(); here we (1) merge the erxes turn meta (ordered parts,
// thinking, tool calls, interrupted flag, learnings-in-context) and attachment
// pointers into each message's content.metadata.erxes, and (2) stamp
// thread.metadata.agentId so the native thread list can filter by agent (a
// binding Mastra has no concept of). Best-effort; the caller swallows errors.
export async function patchNativeTurn(params: {
  subdomain: string;
  binding: MemoryBinding;
  agentId: string;
  reply: string | null;
  meta?: IMastraMessageMeta;
  attachments?: IMastraChatAttachment[];
}): Promise<string | null> {
  const { subdomain, binding, agentId, reply, meta, attachments } = params;
  const memory = await getMastraMemory(subdomain);

  // Recent messages newest-first. No vectorSearchString → recall is a plain
  // recency list (not semantic search, no embedding/LLM work), and an explicit
  // perPage overrides the instance's lastMessages. The turn just persisted sits
  // at the tail, so the newest assistant/user rows are this turn's.
  const recalled = (await memory.recall({
    threadId: binding.thread,
    resourceId: binding.resource,
    perPage: 4,
    page: 0,
    orderBy: { field: 'createdAt', direction: 'DESC' },
  } as never)) as { messages?: NativeChatMessage[] };
  const recent = recalled?.messages ?? [];

  const patches: { id: string; content: Record<string, unknown> }[] = [];

  const assistant = reply
    ? recent.find((m) => m.role === 'assistant')
    : undefined;
  if (assistant && meta) {
    const erxes: Record<string, unknown> = {
      ...(meta.parts ? { parts: meta.parts } : {}),
      ...(meta.thinking ? { thinking: meta.thinking } : {}),
      ...(meta.toolCalls ? { toolCalls: meta.toolCalls } : {}),
      ...(meta.interrupted ? { interrupted: true } : {}),
      ...(meta.learningIdsInContext?.length
        ? { learningIdsInContext: meta.learningIdsInContext }
        : {}),
      // Langfuse trace id for this turn — lets a later thumbs rating attach a
      // human score to the right trace (Plan B; read by findOwnedAssistantMessage).
      ...(meta.langfuseTraceId
        ? { langfuseTraceId: meta.langfuseTraceId }
        : {}),
    };
    if (Object.keys(erxes).length) {
      patches.push({
        id: assistant.id,
        content: mergeErxesMeta(assistant.content, erxes),
      });
    }
  }

  const userMsg = attachments?.length
    ? recent.find((m) => m.role === 'user')
    : undefined;
  if (userMsg) {
    patches.push({
      id: userMsg.id,
      content: mergeErxesMeta(userMsg.content, { attachments }),
    });
  }

  if (patches.length) {
    await memory.updateMessages({ messages: patches } as never);
  }

  // Stamp the erxes thread↔agent binding + tenant. agentId backs the thread-list
  // filter; subdomain lets the learning sweep enumerate a tenant's threads
  // (native listThreads filters by exact resourceId or metadata, and resourceId
  // is per-user). updateThread requires a title, so preserve the current one
  // (native generateTitle / a later rename own it).
  const thread = (await memory.getThreadById({
    threadId: binding.thread,
    resourceId: binding.resource,
  } as never)) as { title?: string; metadata?: Record<string, unknown> } | null;
  const tMeta = (thread?.metadata ?? {}) as {
    agentId?: string;
    subdomain?: string;
  };
  if (thread && (tMeta.agentId !== agentId || tMeta.subdomain !== subdomain)) {
    await memory.updateThread({
      id: binding.thread,
      title: thread.title ?? '',
      metadata: { ...(thread.metadata ?? {}), agentId, subdomain },
    } as never);
  }

  // The native assistant message id — the client rates this (feedback resolves
  // it back via the native store).
  return assistant?.id ?? null;
}
