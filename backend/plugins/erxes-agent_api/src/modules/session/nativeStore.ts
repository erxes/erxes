// ---------------------------------------------------------------------------
// Native chat store — read/translate layer over Mastra's native memory store.
//
// The chat UI's GraphQL/SSE contract (MastraThread / MastraMessage) is served
// straight from Mastra-native threads/messages (erxes_mastra_memory) — there is
// no bespoke mongoose store. Tenant + ownership isolation is by resourceId
// (scopedResource(subdomain, userId)); the erxes↔agent binding and the rich
// per-turn artifacts live in thread.metadata.agentId and the namespaced
// message content.metadata.erxes blob (written by persistTurn's patch).
// ---------------------------------------------------------------------------
import { ExpectedError } from 'erxes-api-shared/utils';
import {
  getMastraMemory,
  getMastraStore,
  scopedResource,
} from '~/mastra/memory/mastraMemory';

// ── Minimal native shapes we read (Mastra's own types are wider). ───────────
interface NativeThread {
  id: string;
  title?: string;
  resourceId: string;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}
interface NativeMessage {
  id: string;
  role: string;
  threadId?: string;
  createdAt?: Date;
  content?: {
    content?: string;
    metadata?: { erxes?: Record<string, unknown> };
  } & Record<string, unknown>;
}

// ── Typed facade over Mastra's native memory/store ──────────────────────────
// Mastra's published Memory/store generics are wider than (and shaped
// differently from) the read/write slice this layer drives, so every call site
// used to launder its args through `as never`. Declare the exact surface once
// here and cast at the single facade boundary (getNativeMemory) — the call
// sites stay fully typed.
interface NativeMemoryFacade {
  recall(args: {
    threadId: string;
    resourceId: string;
    perPage: number | false;
    page: number;
    orderBy?: { field: string; direction: 'ASC' | 'DESC' };
  }): Promise<{ messages?: NativeMessage[]; total?: number }>;
  getThreadById(args: {
    threadId: string;
    resourceId?: string;
  }): Promise<NativeThread | null>;
  listThreads(args: {
    filter?: { resourceId?: string; metadata?: Record<string, unknown> };
    orderBy?: { field: string; direction: 'ASC' | 'DESC' };
    perPage?: number | false;
  }): Promise<{ threads?: NativeThread[]; total?: number }>;
  createThread(args: {
    threadId: string;
    resourceId: string;
    title: string;
    metadata?: Record<string, unknown>;
  }): Promise<NativeThread>;
  updateThread(args: {
    id: string;
    title: string;
    metadata?: Record<string, unknown>;
  }): Promise<NativeThread>;
  deleteThread(threadId: string): Promise<unknown>;
  updateMessages(args: {
    messages: { id: string; content: Record<string, unknown> }[];
  }): Promise<unknown>;
}

// Storage-domain methods Memory itself doesn't surface (e.g. message-id lookup
// for feedback). Reached via getMastraStore().stores.memory.
interface NativeStoreFacade {
  listMessagesById(args: {
    messageIds: string[];
  }): Promise<{ messages: NativeMessage[] }>;
}

/** The shared Mastra Memory, typed to the slice this layer uses. Single cast
 *  boundary — call sites get the facade, never the raw `as never` calls. */
export async function getNativeMemory(
  subdomain: string,
): Promise<NativeMemoryFacade> {
  return (await getMastraMemory(subdomain)) as unknown as NativeMemoryFacade;
}

/** The native store's message domain, typed to the lookup feedback needs. */
async function getNativeStore(subdomain: string): Promise<NativeStoreFacade> {
  const store = await getMastraStore(subdomain);
  return (store as unknown as { stores: { memory: NativeStoreFacade } }).stores
    .memory;
}

/**
 * Update a thread while preserving the bits a blind updateThread would clobber.
 * Mastra's updateThread requires a title and replaces metadata wholesale, so
 * every caller has to re-supply the current title and spread the existing
 * metadata before layering its patch. This centralises that dance: pass the
 * thread you read and the metadata keys to set; the title and untouched
 * metadata carry through. (native generateTitle / a manual rename own the
 * title; an empty fallback keeps generateTitle eligible.)
 */
async function preserveTitleUpdate(
  memory: NativeMemoryFacade,
  thread: Pick<NativeThread, 'id' | 'title' | 'metadata'> & { id?: string },
  threadId: string,
  metaPatch: Record<string, unknown>,
): Promise<NativeThread> {
  return memory.updateThread({
    id: threadId,
    title: thread.title ?? '',
    metadata: { ...(thread.metadata ?? {}), ...metaPatch },
  });
}

// ── The GraphQL shapes (mirror session/graphql/schemas/session.ts). ─────────
export interface ErxesThread {
  _id: string;
  threadId: string;
  agentId: string | null;
  title: string;
  messageCount: number;
  lastMessageAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
export interface ErxesMessage {
  _id: string;
  threadId: string | null;
  role: string;
  content: string;
  meta: Record<string, unknown> | null;
  attachments: unknown;
  createdAt: Date | null;
}

/** Translate a native thread (+ its derived message count) to the UI's
 *  MastraThread shape, surfacing agentId from metadata. */
function toErxesThread(t: NativeThread, messageCount: number): ErxesThread {
  const meta = (t.metadata ?? {}) as { agentId?: string };
  return {
    _id: t.id,
    threadId: t.id,
    agentId: meta.agentId ?? null,
    title: t.title ?? '',
    messageCount,
    lastMessageAt: t.updatedAt ?? t.createdAt ?? null,
    createdAt: t.createdAt ?? null,
    updatedAt: t.updatedAt ?? null,
  };
}

function toErxesMessage(m: NativeMessage): ErxesMessage {
  // The erxes turn artifacts (parts/thinking/toolCalls/interrupted/
  // learningIdsInContext) + attachments were stored verbatim under
  // content.metadata.erxes by persistTurn's patch; split attachments back out
  // to its own field for the UI.
  const erxes = {
    ...((m.content?.metadata?.erxes ?? {}) as Record<string, unknown>),
  };
  const attachments = erxes.attachments ?? null;
  delete erxes.attachments;
  return {
    _id: m.id,
    threadId: m.threadId ?? null,
    role: m.role,
    content: typeof m.content?.content === 'string' ? m.content.content : '',
    meta: Object.keys(erxes).length ? erxes : null,
    attachments,
    createdAt: m.createdAt ?? null,
  };
}

/** Message count for a thread without fetching the transcript (recall → total). */
async function countMessages(
  memory: NativeMemoryFacade,
  threadId: string,
  resourceId: string,
): Promise<number> {
  const res = await memory.recall({
    threadId,
    resourceId,
    perPage: 1,
    page: 0,
  });
  return res?.total ?? 0;
}

// Cap on concurrent per-thread countMessages recalls. The native store exposes
// no per-thread total in listThreads, so each thread still needs its own recall;
// bounding the fan-out keeps a large thread list from opening hundreds of
// simultaneous store reads (the data shape returned is unchanged).
const COUNT_CONCURRENCY = 8;

/** Map `items` to results with bounded concurrency, preserving order. Each
 *  item's builder gets its thread's message count (recalled lazily). */
async function withMessageCounts<T, R>(
  memory: NativeMemoryFacade,
  items: T[],
  threadOf: (item: T) => { id: string; resourceId: string },
  build: (item: T, count: number) => R,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < items.length) {
      const i = cursor++;
      const { id, resourceId } = threadOf(items[i]);
      out[i] = build(items[i], await countMessages(memory, id, resourceId));
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(COUNT_CONCURRENCY, items.length) }, worker),
  );
  return out;
}

/** A user's own threads for an agent (newest first), in the UI shape. */
export async function listOwnedThreads(
  subdomain: string,
  userId: string,
  agentId: string,
): Promise<ErxesThread[]> {
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  const res = await memory.listThreads({
    filter: { resourceId, metadata: { agentId } },
    orderBy: { field: 'updatedAt', direction: 'DESC' },
    perPage: false,
  });
  const threads = res?.threads ?? [];
  return withMessageCounts(
    memory,
    threads,
    (t) => ({ id: t.id, resourceId }),
    (t, count) => toErxesThread(t, count),
  );
}

/**
 * Register a chat thread in the native store and stamp its erxes↔agent binding
 * (metadata.agentId + tenant) BEFORE the turn streams — so the session is
 * immediately listable (listOwnedThreads filters on metadata.agentId) and
 * survives a reload that happens WHILE the agent is still running.
 *
 * Without this the thread is created and tagged only at turn-end: Mastra does
 * not persist a thread until the run finishes (no savePerStep), and the agentId
 * tag is written by patchNativeTurn after the stream loop. So refreshing mid-run
 * — which also aborts the SSE run — left no agentId-tagged thread for the
 * sidebar query to find, and the in-flight session vanished.
 *
 * Idempotent: creates the thread when absent, back-fills the binding when an
 * existing thread is missing/stale on it, and no-ops otherwise. The caller gates
 * on a memory binding (advanced memory + known tenant) and treats it as
 * best-effort — a store hiccup here must never block the turn.
 */
export async function ensureThreadRegistered(
  subdomain: string,
  threadId: string,
  resourceId: string,
  agentId: string,
): Promise<void> {
  const memory = await getNativeMemory(subdomain);
  const existing = await memory.getThreadById({ threadId, resourceId });

  if (!existing) {
    // Empty title keeps native generateTitle eligible (it only fills a blank
    // title, once, at turn-end). The UI renders a blank title as "New chat".
    await memory.createThread({
      threadId,
      resourceId,
      title: '',
      metadata: { agentId, subdomain },
    });
    return;
  }

  const meta = (existing.metadata ?? {}) as {
    agentId?: string;
    subdomain?: string;
  };
  if (meta.agentId === agentId && meta.subdomain === subdomain) return;
  await preserveTitleUpdate(memory, existing, threadId, { agentId, subdomain });
}

/** Ownership-checked transcript for one thread (chronological), UI shape. */
export async function getOwnedThreadMessages(
  subdomain: string,
  userId: string,
  threadId: string,
): Promise<ErxesMessage[]> {
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  // Ownership: getThreadById filters by resourceId, so another user's thread
  // (or a bot thread) reads back as null — reported as "not found", no leak.
  const thread = await memory.getThreadById({ threadId, resourceId });
  if (!thread) throw new ExpectedError('Thread not found');
  const res = await memory.recall({
    threadId,
    resourceId,
    perPage: false,
    page: 0,
    orderBy: { field: 'createdAt', direction: 'ASC' },
  });
  return (res?.messages ?? []).map(toErxesMessage);
}

/** Rename a thread the caller owns. Records titleSource='manual' so native
 *  generateTitle (which only fires while the title is empty) never overrides it. */
export async function renameOwnedThread(
  subdomain: string,
  userId: string,
  threadId: string,
  title: string,
): Promise<ErxesThread> {
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  const thread = await memory.getThreadById({ threadId, resourceId });
  if (!thread) throw new ExpectedError('Thread not found');
  const updated = await memory.updateThread({
    id: threadId,
    title,
    metadata: { ...(thread.metadata ?? {}), titleSource: 'manual' },
  });
  return toErxesThread(
    updated,
    await countMessages(memory, threadId, resourceId),
  );
}

/** Delete a thread the caller owns (and its messages + vectors). */
export async function removeOwnedThread(
  subdomain: string,
  userId: string,
  threadId: string,
): Promise<{ ok: number }> {
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  const thread = await memory.getThreadById({ threadId, resourceId });
  if (!thread) throw new ExpectedError('Thread not found');
  await memory.deleteThread(threadId);
  return { ok: 1 };
}

/** Throw "Thread not found" unless the caller owns the thread (resource scope). */
export async function assertOwnedThread(
  subdomain: string,
  userId: string,
  threadId: string,
): Promise<void> {
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  const thread = await memory.getThreadById({ threadId, resourceId });
  if (!thread) throw new ExpectedError('Thread not found');
}

/** Current native title for a thread (for the SSE thread_title push). */
export async function getThreadTitle(
  subdomain: string,
  threadId: string,
  resourceId: string,
): Promise<string | null> {
  const memory = await getNativeMemory(subdomain);
  const thread = await memory.getThreadById({ threadId, resourceId });
  return thread?.title || null;
}

// ── Learning sweep (distillation) over native threads ───────────────────────

export interface SweepThread {
  threadId: string;
  resourceId: string;
  agentId: string | null;
  updatedAt: Date | null;
  totalCount: number;
  distilledCount: number;
}

/**
 * A tenant's threads (oldest activity first) with the counters the learning
 * sweep needs to find idle, undistilled conversations. Filtered by
 * metadata.subdomain (stamped by patchNativeTurn) since resourceId is per-user.
 */
export async function listTenantThreadsForSweep(
  subdomain: string,
  fetchLimit: number,
): Promise<SweepThread[]> {
  const memory = await getNativeMemory(subdomain);
  const res = await memory.listThreads({
    filter: { metadata: { subdomain } },
    orderBy: { field: 'updatedAt', direction: 'ASC' },
    perPage: fetchLimit,
  });
  const threads = res?.threads ?? [];
  return withMessageCounts(
    memory,
    threads,
    (t) => ({ id: t.id, resourceId: t.resourceId }),
    (t, totalCount) => {
      const meta = (t.metadata ?? {}) as {
        agentId?: string;
        distilledMessageCount?: number;
      };
      return {
        threadId: t.id,
        resourceId: t.resourceId,
        agentId: meta.agentId ?? null,
        updatedAt: t.updatedAt ?? null,
        totalCount,
        distilledCount: meta.distilledMessageCount ?? 0,
      };
    },
  );
}

/** The undistilled tail of a thread as plain {role,content} for distillation. */
export async function getThreadTail(
  subdomain: string,
  threadId: string,
  resourceId: string,
  cursor: number,
): Promise<{ role: string; content: string }[]> {
  const memory = await getNativeMemory(subdomain);
  const res = await memory.recall({
    threadId,
    resourceId,
    perPage: false,
    page: 0,
    orderBy: { field: 'createdAt', direction: 'ASC' },
  });
  const all = (res?.messages ?? []).map((m) => ({
    role: m.role,
    content: typeof m.content?.content === 'string' ? m.content.content : '',
  }));
  return all.slice(cursor);
}

/** Advance the distillation cursor (metadata.distilledMessageCount) on a thread. */
export async function markThreadDistilled(
  subdomain: string,
  threadId: string,
  resourceId: string,
  count: number,
): Promise<void> {
  const memory = await getNativeMemory(subdomain);
  const thread = await memory.getThreadById({ threadId, resourceId });
  if (!thread) return;
  await preserveTitleUpdate(memory, thread, threadId, {
    distilledMessageCount: count,
  });
}

// What a message-id feedback lookup needs back: the owning thread + the
// learnings that were in that turn's context.
export interface OwnedAssistantMessage {
  threadId: string;
  learningIdsInContext: string[];
  // Langfuse trace id stamped on this turn (Plan B) — for attaching a human
  // thumbs score to the right trace. Undefined when evaluation was off.
  langfuseTraceId?: string;
}

/**
 * Resolve an assistant message by its native id for the feedback mutation:
 * verifies it is the caller's own assistant message and returns the learnings
 * stamped into that turn's context. Throws "Message not found" otherwise.
 */
export async function findOwnedAssistantMessage(
  subdomain: string,
  userId: string,
  messageId: string,
): Promise<OwnedAssistantMessage> {
  const store = await getNativeStore(subdomain);
  const { messages } = (await store.listMessagesById({
    messageIds: [messageId],
  })) ?? { messages: [] };
  const msg = messages?.[0];
  if (!msg || msg.role !== 'assistant' || !msg.threadId) {
    throw new ExpectedError('Message not found');
  }
  // Ownership: the message's thread must belong to this user (resource scope).
  const memory = await getNativeMemory(subdomain);
  const resourceId = scopedResource(subdomain, userId);
  const thread = await memory.getThreadById({
    threadId: msg.threadId,
    resourceId,
  });
  if (!thread) throw new ExpectedError('Message not found');

  const erxes = (msg.content?.metadata?.erxes ?? {}) as {
    learningIdsInContext?: string[];
    langfuseTraceId?: string;
  };
  return {
    threadId: msg.threadId,
    learningIdsInContext: erxes.learningIdsInContext ?? [],
    langfuseTraceId: erxes.langfuseTraceId,
  };
}
