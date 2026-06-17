import { runWithAuth } from '~/mastra/requestContext';
import {
  MemoryBinding,
  ToolResultLike,
  TurnAgent,
  TurnAuthCtx,
  TurnMessage,
} from '@/agent/types';
import {
  buildFallbackFromResults,
  isRealToolData,
  isSearchResult,
} from '@/agent/fallback';

// Turn execution (blocking). Runs a single agent turn over the full
// conversation array and returns the reply text (or null). With native
// multi-step generate() the model produces the final answer itself; only a turn
// that ends with tool calls but no text gets synthesized. Throws a user-facing
// message on hard failures.
export async function runAgentTurn(params: {
  agent: TurnAgent;
  convo: TurnMessage[];
  message: string;
  authCtx: TurnAuthCtx;
  memory?: MemoryBinding;
}): Promise<string | null> {
  const { agent, convo, message, authCtx, memory } = params;
  const genOpts = memory ? { memory } : undefined;
  // With a memory binding, hand generate() the new user message as a STRING —
  // Mastra Memory only persists (and recalls against) string input; passing the
  // convo array silently skips the save. (Recent history + recall come from
  // Mastra Memory itself; the learned digest is already woven into `message`.)
  const input = memory ? message : convo;

  try {
    const result = await runWithAuth(authCtx, () =>
      agent.generate(input, genOpts),
    );

    if (result.text) return result.text;

    // Collect tool results from all steps, deduplicated.
    const uniqueResults = dedupeToolResults([
      ...(result.toolResults || []),
      ...(result.steps || []).flatMap((step) => step.toolResults || []),
    ]);

    if (!uniqueResults.length) return null;

    // Diagnostic: what did the agent actually call, and what came back?
    logToolResults(uniqueResults);

    return await synthesizeFromToolResults({
      agent,
      message,
      authCtx,
      toolResults: uniqueResults,
    });
  } catch (err) {
    throw toUserFacingError(err);
  }
}

// Map a raw failure to a plain-language, non-technical message (the prompt
// rules forbid jargon/ids/HTTP codes in replies — the error path must honour
// that too). First matching rule wins; unmatched errors are logged server-side
// and fall through to a generic message so no raw provider text reaches a user.
const ERROR_RULES: { test: RegExp; message: string }[] = [
  {
    test: /too many requests|rate.?limit|\b429\b/i,
    message:
      'The AI provider is temporarily rate-limited. Please wait a moment and try again.',
  },
  {
    test: /unauthorized|forbidden|permission|access denied|invalid api key|\b401\b|\b403\b/i,
    message:
      "I couldn't complete that — it needs a permission or credential that isn't available. Please check with an admin.",
  },
  {
    test: /timed? ?out|etimedout|econnrefused|econnreset|socket hang up|network|fetch failed|enotfound/i,
    message:
      'The service took too long to respond or was unreachable. Please try again in a moment.',
  },
  {
    test: /bad gateway|service unavailable|internal server error|\b50[0234]\b/i,
    message:
      'The service is temporarily unavailable. Please try again shortly.',
  },
  {
    test: /validation|is required|invalid input|must be a|failed to parse/i,
    message:
      'Some required information was missing or invalid. Please rephrase or add the missing details.',
  },
];

/** Map a raw failure to a plain-language Error safe to show a user (jargon-,
 *  id- and HTTP-code-free); unmatched errors are logged (redacted) and replaced
 *  with a generic message so no raw provider text leaks. */
export function toUserFacingError(err: unknown): Error {
  const msg: string =
    (err as { message?: string } | null | undefined)?.message ?? String(err);
  const rule = ERROR_RULES.find((r) => r.test.test(msg));
  if (rule) return new Error(rule.message);
  // Unmatched: log for operators (never shown to the user), but redact long
  // tokens first — provider errors can echo API keys, bearer tokens, connection
  // strings or hashes that log aggregators shouldn't capture.
  const safe = msg
    .replace(
      /\b(bearer\s+|api[_-]?key=|token=|:)[A-Za-z0-9._-]{16,}/gi,
      '$1[redacted]',
    )
    .replace(/[A-Za-z0-9_-]{32,}/g, '[redacted]');
  console.error('[toUserFacingError] unmatched error:', safe);
  return new Error(
    'Something went wrong while processing your request. Please try again — if it keeps happening, contact support.',
  );
}

/** Drop duplicate tool results gathered across steps, keyed by tool-call id. */
export function dedupeToolResults(
  gathered: ToolResultLike[],
): ToolResultLike[] {
  const seenIds = new Set<string>();
  return gathered.filter((tr) => {
    const id = tr.toolCallId || tr.id || JSON.stringify(tr);
    return seenIds.has(id) ? false : (seenIds.add(id), true);
  });
}

/** Diagnostic log of which tools ran and the shape of what each returned. */
export function logToolResults(uniqueResults: ToolResultLike[]) {
  console.log(
    '[mastraAgentChat] tool results:',
    JSON.stringify(
      uniqueResults.map((tr) => {
        const data = tr.result ?? tr;
        const record =
          data && typeof data === 'object'
            ? (data as Record<string, unknown>)
            : null;
        return {
          tool: tr.toolName || tr.name,
          shape:
            data == null
              ? 'null'
              : Array.isArray(data)
                ? `array(${data.length})`
                : typeof data === 'object'
                  ? Object.keys(data).slice(0, 6)
                  : typeof data,
          success: record ? record.success : undefined,
          error: record ? record.error || record.message : undefined,
        };
      }),
    ),
  );
}

// Turn a set of tool results into a one-or-two sentence human answer. Skips
// synthesis when nothing real came back (synthesis would fabricate success).
export async function synthesizeFromToolResults(params: {
  agent: TurnAgent;
  message: string;
  authCtx: TurnAuthCtx;
  toolResults: ToolResultLike[];
}): Promise<string> {
  const { agent, message, authCtx, toolResults } = params;

  // search_erxes_operations is navigational; only execute (action) results
  // decide whether the turn produced something real to report.
  const actionResults = toolResults.filter((tr) => !isSearchResult(tr));
  const hasRealResult = actionResults.some((tr) =>
    isRealToolData(tr.result ?? tr),
  );
  const fallback = buildFallbackFromResults(toolResults);

  if (!hasRealResult) {
    return fallback || 'Something went wrong. Please try again.';
  }

  // All tool calls succeeded — synthesise a human-readable summary from the
  // action results (the search listing would only distract the model).
  const toolContext = actionResults
    .map((tr) => {
      const name = tr.toolName || tr.name || 'tool';
      const data = tr.result ?? tr;
      return `[${name}]:\n${
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      }`;
    })
    .join('\n\n');

  const synthesisMessages: TurnMessage[] = [
    {
      role: 'user',
      content: `Report the following tool results accurately to the user in one or two sentences. Do not call any tools. Do not invent information not present in the results.\n\nUser request: ${message}\n\n${toolContext}`,
    },
  ];

  try {
    const synthesis = await runWithAuth(authCtx, () =>
      agent.generate(synthesisMessages, { maxSteps: 1 }),
    );
    return synthesis.text || fallback || 'Done.';
  } catch {
    return fallback || 'Done.';
  }
}
