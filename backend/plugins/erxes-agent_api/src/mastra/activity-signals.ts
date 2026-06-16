// ---------------------------------------------------------------------------
// Cheap activity signals — instant, LLM-free status lines for tool calls.
//
// activity.ts narrates the agent's *reasoning* with a model round-trip, but a
// TOOL invocation already says what the step is: its name + args. So for tool
// events we derive the status line directly here — no LLM, emitted the moment
// the call starts. Known tools get a concrete line; anything unrecognized
// returns null so the caller falls back to the LLM summarizer.
// ---------------------------------------------------------------------------

const MAX_CHARS = 80;

/** First non-empty string value among the given arg keys. */
function pick(args: unknown, keys: string[]): string | undefined {
  if (!args || typeof args !== 'object') return undefined;
  const rec = args as Record<string, unknown>;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === 'string' && v.trim()) return v.trim().replace(/\s+/g, ' ');
  }
  return undefined;
}

const clip = (s: string) =>
  s.length > MAX_CHARS ? `${s.slice(0, MAX_CHARS).trimEnd()}…` : s;

const phrase = (verb: string, subject?: string) =>
  clip(subject ? `${verb} ${subject}` : verb);

/**
 * A present-continuous status line for a tool call, or null when the tool is
 * unknown (let the LLM summarizer narrate it). Mirrors ACTIVITY_INSTRUCTIONS:
 * 3-8 words, concrete subject, no punctuation/emoji.
 */
export function toolStatusLine(toolName: string, args?: unknown): string | null {
  switch (toolName) {
    case 'search_erxes_operations': {
      const q = pick(args, ['query']);
      return phrase('Searching operations', q ? `for ${q}` : undefined);
    }
    case 'execute_erxes_operation': {
      const op = pick(args, ['operation', 'operationName']);
      return op ? phrase('Running', op) : 'Running an operation';
    }
    case 'company-knowledge': {
      const q = pick(args, ['query']);
      return phrase('Searching company data', q ? `for ${q}` : undefined);
    }
    case 'web-search': {
      const q = pick(args, ['query', 'q', 'search']);
      return phrase('Searching the web', q ? `for ${q}` : undefined);
    }
    case 'fetch-url': {
      const url = pick(args, ['url', 'href']);
      return phrase('Fetching', url);
    }
    case 'calculator':
      return 'Calculating';
    case 'render-chart':
      return 'Rendering a chart';
    case 'readAttachment':
      return 'Reading the attachment';
    default:
      return null;
  }
}
