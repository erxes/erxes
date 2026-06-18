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
  const record = args as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim().replace(/\s+/g, ' ');
    }
  }
  return undefined;
}

/** Truncate a status line to the display budget, with an ellipsis. */
const clip = (text: string) =>
  text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS).trimEnd()}…` : text;

/** Compose a "<verb> <subject>" status line (subject optional), clipped. */
const phrase = (verb: string, subject?: string) =>
  clip(subject ? `${verb} ${subject}` : verb);

/**
 * A present-continuous status line for a tool call, or null when the tool is
 * unknown (let the LLM summarizer narrate it). Mirrors ACTIVITY_INSTRUCTIONS:
 * 3-8 words, concrete subject, no punctuation/emoji.
 */
export function toolStatusLine(
  toolName: string,
  args?: unknown,
): string | null {
  switch (toolName) {
    case 'search_erxes_operations': {
      const query = pick(args, ['query']);
      return phrase('Searching operations', query ? `for ${query}` : undefined);
    }
    case 'execute_erxes_operation': {
      const op = pick(args, ['operation', 'operationName']);
      return op ? phrase('Running', op) : 'Running an operation';
    }
    case 'company-knowledge': {
      const query = pick(args, ['query']);
      return phrase(
        'Searching company data',
        query ? `for ${query}` : undefined,
      );
    }
    case 'web-search': {
      const query = pick(args, ['query', 'q', 'search']);
      return phrase('Searching the web', query ? `for ${query}` : undefined);
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
