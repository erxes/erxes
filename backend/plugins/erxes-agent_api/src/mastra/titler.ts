// ---------------------------------------------------------------------------
// Conversation auto-titler.
//
// Replaces the first-message-snippet thread title with a short LLM summary of
// the conversation. Runs AFTER a turn persists (fire-and-forget from the
// blocking GraphQL path, awaited briefly after `done` on the SSE path so the
// client can show the new title immediately).
//
// Same shape as the working-memory extractor: a dedicated tool-less agent
// cached per provider+model, heavy deps imported lazily, best-effort — a
// titling failure never affects the chat turn.
// ---------------------------------------------------------------------------

import { IModels } from '~/connectionResolvers';
import { trimEdgeChars } from '~/mastra/text';
import type { ProviderDocLike } from '~/mastra/providers';

export const TITLER_INSTRUCTIONS = `You name chat conversations.
Given the conversation, output a short title (3-6 words) that captures what it is about.
Rules:
- Write the title in the same language the user writes in.
- Describe the topic or task, not the greeting (never "Hello" or "Greeting").
- No quotes, no trailing punctuation, no emoji, no markdown.
- Output ONLY the title text, nothing else.`;

// How many trailing messages to feed the titler.
const TRANSCRIPT_MESSAGES = 12;
const TITLE_MAX_CHARS = 60;
// Regenerate after this many new messages so the title tracks the topic.
const REFRESH_EVERY = 6;

// ── Pure helpers (unit-testable) ─────────────────────────────────────────────

/** Whether the thread is due for (re)generation. Manual titles are final. */
export function shouldGenerateTitle(thread: {
  titleSource?: string;
  titleMessageCount?: number;
  messageCount?: number;
}): boolean {
  if (!thread) return false;
  if (thread.titleSource === 'manual') return false;
  if (thread.titleSource !== 'generated') return true; // derived/missing → first pass
  const at = thread.titleMessageCount ?? 0;
  return (thread.messageCount ?? 0) >= at + REFRESH_EVERY;
}

/** Normalize raw model output into a usable title, or null when unusable. */
export function sanitizeTitle(raw: string | null | undefined): string | null {
  let title = (raw || '').split('\n')[0].replace(/\s+/g, ' ').trim();
  // Strip wrapping quotes/backticks and a "Title:" prefix some models add.
  title = title.replace(/^title\s*:\s*/i, '');
  title = trimEdgeChars(title, '"\'`“”‘’', '"\'`“”‘’.').trim();
  if (!title) return null;
  if (title.length > TITLE_MAX_CHARS) {
    title = `${title.slice(0, TITLE_MAX_CHARS).trimEnd()}…`;
  }
  return title;
}

// ── Orchestration ─────────────────────────────────────────────────────────────

// The minimal surface used from a Mastra Agent — typed locally so the lazy
// import keeps this module free of a static @mastra/core type dependency.
interface TitlerAgent {
  // Mastra's built-in title generator: formats the messages + applies our
  // instructions internally, returns the title text (or undefined).
  generateTitleFromUserMessage(args: {
    messages: { role: string; content: string }[];
    instructions?: string;
  }): Promise<string | undefined>;
}

// Tool-less titler agents, cached per provider+model.
const _titlers = new Map<string, TitlerAgent>();

/** Lazily build (and cache per provider+model) the titler agent. */
async function titlerFor(
  provider: string,
  model: string,
  providers: ProviderDocLike[],
): Promise<TitlerAgent> {
  const key = `${provider}:${model}`;
  let cached = _titlers.get(key);
  if (!cached) {
    const { Agent } = await import('@mastra/core/agent');
    const { buildModel } = await import('~/mastra/providers');
    cached = new Agent({
      id: 'mastra-thread-titler',
      name: 'Thread Titler',
      instructions: TITLER_INSTRUCTIONS,
      model: buildModel(provider, model, providers),
    }) as unknown as TitlerAgent;
    _titlers.set(key, cached);
  }
  return cached;
}

/**
 * Summarize the conversation into a thread title and persist it. Returns the
 * new title when one was generated and applied, null otherwise. Never throws.
 */
export async function maybeGenerateThreadTitle(params: {
  models: IModels;
  threadId: string;
  provider: string;
  model: string;
  providers: ProviderDocLike[];
  authCtx: { userHeader?: string; token?: string; subdomain?: string };
}): Promise<string | null> {
  const { models, threadId, provider, model, providers } = params;
  // Reject non-string ids so a crafted object can never become a Mongo
  // query operator (NoSQL injection).
  if (typeof threadId !== 'string' || !threadId) return null;
  try {
    const thread = await models.MastraThread.findOne({ threadId });
    if (!thread || !shouldGenerateTitle(thread)) return null;

    const history = await models.MastraMessage.getRecent(
      threadId,
      TRANSCRIPT_MESSAGES,
    );
    if (!history.length) return null;

    // Mastra's built-in titler formats the messages + applies our instructions.
    // No auth context needed — titling makes a plain LLM call (no erxes tools).
    const titler = await titlerFor(provider, model, providers);
    const raw = await titler.generateTitleFromUserMessage({
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      instructions: TITLER_INSTRUCTIONS,
    });

    const title = sanitizeTitle(raw);
    if (!title) return null;

    const applied = await models.MastraThread.setGeneratedTitle(
      threadId,
      title,
      thread.messageCount ?? 0,
    );
    return applied ? title : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:titler] title generation skipped: ${e?.message || e}`,
    );
    return null;
  }
}
