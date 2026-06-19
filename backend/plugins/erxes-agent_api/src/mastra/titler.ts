// ---------------------------------------------------------------------------
// Conversation auto-titler — instructions + pure helpers.
//
// Thread titling itself is owned by Mastra's native generateTitle, configured
// on the shared Memory (see mastraMemory.ts) with the instructions below — so
// there is no custom titler agent / LLM call here any more. The pure helpers
// remain for reuse and unit tests.
// ---------------------------------------------------------------------------

import { trimEdgeChars } from '~/mastra/text';

export const TITLER_INSTRUCTIONS = `You name chat conversations.
Given the conversation, output a short title (3-6 words) that captures what it is about.
Rules:
- Write the title in the same language the user writes in.
- Describe the topic or task, not the greeting (never "Hello" or "Greeting").
- No quotes, no trailing punctuation, no emoji, no markdown.
- Output ONLY the title text, nothing else.`;

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
