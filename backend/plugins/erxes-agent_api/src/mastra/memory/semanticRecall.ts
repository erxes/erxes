// ---------------------------------------------------------------------------
// Advanced Memory — semantic recall.
//
// Embed-on-write (index each message into Qdrant) + recall-on-read (retrieve the
// most relevant past snippets and return them as a context block). Both ops are
// best-effort: they never throw, so a Qdrant/embedder hiccup degrades to plain
// recent-history replay instead of breaking the chat.
//
// Pure helpers (filter / point / format / score) are exported for unit testing.
// ---------------------------------------------------------------------------

import { createHash } from 'crypto';
import {
  collectionName,
  resolveEmbedderConfig,
  resolveRecallTuning,
} from './config';
import { getEmbedder } from './embedder';
import { upsert, search, QdrantPoint, SearchHit } from './vectorStore';
import { setMemoryHealth } from './health';

export interface MemoryContext {
  subdomain: string;
  resourceId: string;
  threadId: string;
  agentId: string;
}

export interface IndexableMessage {
  id: string; // source (Mongo) message id
  role: string;
  text: string;
  createdAt?: string;
}

// ── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Build the Qdrant filter. ALWAYS scoped to a subdomain (tenant isolation);
 * refuses to build a filter without one — fail-closed, never query globally.
 */
export function buildRecallFilter(args: {
  subdomain: string;
  scope: 'resource' | 'thread';
  resourceId?: string;
  threadId?: string;
}): { must: any[] } {
  if (!args.subdomain) {
    throw new Error(
      '[mastra:memory] refusing to query Qdrant without a subdomain (tenant isolation).',
    );
  }
  const must: any[] = [{ key: 'subdomain', match: { value: args.subdomain } }];
  if (args.scope === 'resource') {
    if (args.resourceId) {
      must.push({ key: 'resourceId', match: { value: args.resourceId } });
    }
  } else if (args.threadId) {
    must.push({ key: 'threadId', match: { value: args.threadId } });
  }
  return { must };
}

/** A Qdrant point with the full tenant-aware payload. */
export function toPoint(args: {
  pointId: string;
  messageId: string;
  vector: number[];
  subdomain: string;
  resourceId: string;
  threadId: string;
  agentId: string;
  role: string;
  text: string;
  createdAt?: string;
}): QdrantPoint {
  return {
    id: args.pointId,
    vector: args.vector,
    payload: {
      subdomain: args.subdomain,
      resourceId: args.resourceId,
      threadId: args.threadId,
      agentId: args.agentId,
      role: args.role,
      messageId: args.messageId,
      text: args.text,
      createdAt: args.createdAt ?? null,
    },
  };
}

export function filterHitsByScore(
  hits: SearchHit[],
  minScore: number,
): SearchHit[] {
  return hits.filter((h) => h.score >= minScore);
}

/**
 * Render recalled snippets as a plain `system` context block — NEVER tool-call
 * frames (keeps reasoning models like Kimi happy). Returns null when empty.
 */
export function formatRecallBlock(
  hits: Array<{ text?: string }>,
): string | null {
  const texts = hits.map((h) => (h.text ?? '').trim()).filter(Boolean);
  if (!texts.length) return null;
  const lines = texts.map((t) => `- ${t}`).join('\n');
  // The staleness caveat matters: recalled snippets include old ERROR reports
  // ("operation X fails with …") that outlive the bug they describe — observed
  // live steering an agent away from operations that now work. Current tool
  // results must always win over recollections.
  return (
    'Relevant context from earlier conversations (recollections, possibly outdated — ' +
    'if a recollection says something failed or was broken, ignore it and trust your ' +
    'current tool results instead):\n' +
    lines
  );
}

/** Deterministic UUID-shaped point id from the source message id (idempotent upserts). */
export function pointIdFor(subdomain: string, messageId: string): string {
  const h = createHash('sha256')
    .update(`${subdomain}:${messageId}`)
    .digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

// ── Orchestration (best-effort; never throws) ────────────────────────────────

let _warned = false;
function warnOnce(msg: string) {
  if (_warned) return;
  // eslint-disable-next-line no-console
  console.warn(msg);
  _warned = true;
}

/** Embed the query and return a recall context block (or null). Never throws. */
export async function recallBlock(
  query: string,
  ctx: MemoryContext,
): Promise<string | null> {
  try {
    const emb = resolveEmbedderConfig();
    const tuning = resolveRecallTuning();
    const collection = collectionName(emb.model, emb.dimension);

    const embedder = await getEmbedder(emb);
    const [vector] = await embedder.embed([query]);
    if (!vector) return null;

    const filter = buildRecallFilter({
      subdomain: ctx.subdomain,
      scope: tuning.scope,
      resourceId: ctx.resourceId,
      threadId: ctx.threadId,
    });
    const hits = await search(collection, vector, {
      topK: tuning.topK,
      filter,
    });
    setMemoryHealth(true);

    const kept = filterHitsByScore(hits, tuning.minScore);
    return formatRecallBlock(kept.map((h) => ({ text: h.payload?.text })));
  } catch (e: any) {
    warnOnce(`[mastra:memory] recall skipped: ${e?.message || e}`);
    return null;
  }
}

/** Embed + upsert the given messages into Qdrant. Never throws. */
export async function indexMessages(
  ctx: MemoryContext,
  messages: IndexableMessage[],
): Promise<void> {
  try {
    const usable = messages.filter((m) => (m.text ?? '').trim());
    if (!usable.length) return;

    const emb = resolveEmbedderConfig();
    const collection = collectionName(emb.model, emb.dimension);
    const embedder = await getEmbedder(emb);
    const vectors = await embedder.embed(usable.map((m) => m.text));

    const points: QdrantPoint[] = usable.map((m, i) =>
      toPoint({
        pointId: pointIdFor(ctx.subdomain, m.id),
        messageId: m.id,
        vector: vectors[i],
        subdomain: ctx.subdomain,
        resourceId: ctx.resourceId,
        threadId: ctx.threadId,
        agentId: ctx.agentId,
        role: m.role,
        text: m.text,
        createdAt: m.createdAt,
      }),
    );
    await upsert(collection, points);
    setMemoryHealth(true);
  } catch (e: any) {
    warnOnce(`[mastra:memory] indexing skipped: ${e?.message || e}`);
  }
}
