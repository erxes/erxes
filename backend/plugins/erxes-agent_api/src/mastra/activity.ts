// ---------------------------------------------------------------------------
// Live activity summarizer — "what is the agent doing right now".
//
// Turns the in-flight turn's raw signals (reasoning deltas, tool invocations)
// into one short human status line. Generic and transport-agnostic:
//
//   summarizeActivity()      — one-shot: snapshot in, status line out.
//   createActivityTracker()  — stream wrapper: feed it thinking/tool events
//                              and it decides WHEN to re-summarize (throttled,
//                              single-flight) and emits the result.
//
// The in-app chat SSE route is the first consumer; future surfaces (workflow
// run monitors, the frontline bot, dashboards) should reuse these instead of
// inventing their own status text.
//
// Same shape as the titler: a dedicated tool-less agent cached per
// provider+model, heavy deps imported lazily, best-effort — a summarization
// failure never affects the turn itself.
// ---------------------------------------------------------------------------

import type { Agent } from '@mastra/core/agent';
import { trimEdgeChars } from '~/mastra/text';
import type { ProviderDocLike } from '~/mastra/providers';

/** Auth context accepted by runWithAuth (the module itself loads lazily). */
type AuthCtx = Parameters<
  (typeof import('~/mastra/requestContext'))['runWithAuth']
>[0];

export const ACTIVITY_INSTRUCTIONS = `You narrate what an AI agent is doing right now.
Given the agent's in-progress reasoning and/or the tool it is invoking, output ONE short status line (3-8 words) describing the CURRENT step.
Rules:
- Write in the same language as the reasoning text (fall back to the user request's language).
- Present continuous voice ("Searching customers", "Comparing pricing plans").
- Name the concrete subject when one is clear ("Looking up order #1042"), never generic filler ("Processing data", "Working on it").
- No quotes, no trailing punctuation, no emoji, no markdown.
- Output ONLY the status line, nothing else.`;

// How much context the summarizer sees, and how long its output may be.
const USER_MESSAGE_CHARS = 200;
const THINKING_TAIL_CHARS = 700;
const TOOL_ARGS_CHARS = 240;
const ACTIVITY_MAX_CHARS = 80;
// Stream policy defaults: at most one summary per interval, and only once
// enough new reasoning accumulated (a tool call always counts as news).
const MIN_INTERVAL_MS = 3000;
const MIN_NEW_THINKING_CHARS = 240;
// Cap the retained reasoning burst — only the tail describes "now".
const THINKING_BUFFER_CHARS = 4000;

// What the summarizer is shown. All fields optional; with neither reasoning
// nor a tool there is nothing live to narrate.
export interface ActivitySnapshot {
  userMessage?: string;
  thinking?: string;
  toolName?: string;
  toolArgs?: unknown;
}

// ── Pure helpers (unit-testable) ─────────────────────────────────────────────

const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

/** Render a snapshot into the summarizer prompt, or null when there is
 *  nothing in-flight worth narrating. */
export function buildActivityContext(snap: ActivitySnapshot): string | null {
  const thinking = (snap.thinking || '').replace(/\s+/g, ' ').trim();
  if (!thinking && !snap.toolName) return null;

  const sections: string[] = [];

  const user = (snap.userMessage || '').replace(/\s+/g, ' ').trim();
  if (user) sections.push(`User request: ${clip(user, USER_MESSAGE_CHARS)}`);

  if (thinking) {
    const tail =
      thinking.length > THINKING_TAIL_CHARS
        ? `…${thinking.slice(-THINKING_TAIL_CHARS)}`
        : thinking;
    sections.push(`Agent reasoning (live tail): ${tail}`);
  }

  if (snap.toolName) {
    let args = '';
    if (snap.toolArgs !== undefined) {
      try {
        args = JSON.stringify(snap.toolArgs);
      } catch {
        args = String(snap.toolArgs);
      }
    }
    sections.push(
      `Invoking tool: ${snap.toolName}${
        args ? ` with ${clip(args, TOOL_ARGS_CHARS)}` : ''
      }`,
    );
  }

  return sections.join('\n');
}

/** Normalize raw model output into a usable status line, or null. */
export function sanitizeActivity(
  raw: string | null | undefined,
): string | null {
  let line = (raw || '').split('\n')[0].replace(/\s+/g, ' ').trim();
  line = line.replace(/^(status|activity)\s*:\s*/i, '');
  line = trimEdgeChars(line, '"\'`“”‘’', '"\'`“”‘’.…').trim();
  if (!line) return null;
  if (line.length > ACTIVITY_MAX_CHARS)
    line = `${line.slice(0, ACTIVITY_MAX_CHARS).trimEnd()}…`;
  return line;
}

// ── One-shot summarizer ──────────────────────────────────────────────────────

// Tool-less summarizer agents, cached per provider+model.
const _summarizers = new Map<string, Agent>();

/** Get (or lazily create and cache) the summarizer agent for a model. */
async function summarizerFor(
  provider: string,
  model: string,
  providers: ProviderDocLike[],
): Promise<Agent> {
  const key = `${provider}:${model}`;
  let summarizer = _summarizers.get(key);
  if (!summarizer) {
    const { Agent: AgentCtor } = await import('@mastra/core/agent');
    const { buildModel } = await import('~/mastra/providers');
    summarizer = new AgentCtor({
      id: 'mastra-activity-summarizer',
      name: 'Activity Summarizer',
      instructions: ACTIVITY_INSTRUCTIONS,
      model: buildModel(provider, model, providers),
    });
    _summarizers.set(key, summarizer);
  }
  return summarizer;
}

/**
 * Summarize an in-flight snapshot into one short status line. Returns null
 * when there is nothing to narrate or the model output is unusable. Never
 * throws.
 */
export async function summarizeActivity(params: {
  provider: string;
  model: string;
  providers: ProviderDocLike[];
  authCtx: AuthCtx;
  snapshot: ActivitySnapshot;
}): Promise<string | null> {
  const { provider, model, providers, authCtx, snapshot } = params;
  try {
    const context = buildActivityContext(snapshot);
    if (!context) return null;

    const { runWithAuth } = await import('~/mastra/requestContext');
    const summarizer = await summarizerFor(provider, model, providers);
    const prompt = `${context}\n\nOutput the status line.`;
    const result = await runWithAuth(
      authCtx,
      (): Promise<{ text?: string }> =>
        summarizer.generate(prompt, { maxSteps: 1 }),
    );

    return sanitizeActivity(result?.text);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:activity] activity summarization skipped: ${message}`,
    );
    return null;
  }
}

// ── Stream tracker ───────────────────────────────────────────────────────────

export interface ActivityTracker {
  /** Feed a reasoning delta. */
  onThinking(text: string): void;
  /** Feed a tool invocation (the tool becomes the current step). */
  onToolCall(toolName: string, args?: unknown): void;
  /** Stop summarizing and emitting (idempotent). */
  stop(): void;
}

/**
 * Wrap a summarize function with the throttling policy a live stream needs:
 * re-summarize when a tool call starts or once enough new reasoning arrived,
 * never more than one LLM call in flight, never more often than the interval,
 * and only emit when the line actually changed.
 */
export function createActivityTracker(opts: {
  summarize: (snapshot: ActivitySnapshot) => Promise<string | null>;
  emit: (text: string) => void;
  // Optional instant, LLM-free status line for a tool call (see
  // activity-signals.toolStatusLine). When it returns a line, that line is
  // emitted immediately and the LLM summarizer is skipped for that step.
  toolSignal?: (toolName: string, args?: unknown) => string | null;
  userMessage?: string;
  minIntervalMs?: number;
  minNewThinkingChars?: number;
}): ActivityTracker {
  const minInterval = opts.minIntervalMs ?? MIN_INTERVAL_MS;
  const minNewChars = opts.minNewThinkingChars ?? MIN_NEW_THINKING_CHARS;

  let stopped = false;
  let inFlight = false;
  let dirty = false;
  let lastRunAt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  let thinking = '';
  let newThinkingChars = 0;
  let tool: { toolName: string; args?: unknown } | undefined;
  let lastEmitted = '';

  /** Summarize the current snapshot once; re-arms itself when stale. */
  async function run(): Promise<void> {
    if (stopped || inFlight) return;
    inFlight = true;
    dirty = false;
    newThinkingChars = 0;
    lastRunAt = Date.now();
    const snapshot: ActivitySnapshot = {
      userMessage: opts.userMessage,
      thinking: thinking || undefined,
      toolName: tool?.toolName,
      toolArgs: tool?.args,
    };
    try {
      const text = await opts.summarize(snapshot);
      if (text && !stopped && text !== lastEmitted) {
        lastEmitted = text;
        opts.emit(text);
      }
    } finally {
      inFlight = false;
      if (dirty && !stopped) schedule();
    }
  }

  /** Arm the next run after the throttle interval (no-op when armed). */
  function schedule(): void {
    if (stopped || timer) return;
    const wait = Math.max(0, lastRunAt + minInterval - Date.now());
    timer = setTimeout(() => {
      timer = null;
      run().catch(() => null);
    }, wait);
  }

  return {
    onThinking(text: string) {
      if (stopped || !text) return;
      thinking += text;
      newThinkingChars += text.length;
      if (thinking.length > THINKING_BUFFER_CHARS) {
        thinking = thinking.slice(-THINKING_BUFFER_CHARS);
      }
      if (newThinkingChars >= minNewChars) {
        dirty = true;
        schedule();
      }
    },
    onToolCall(toolName: string, args?: unknown) {
      if (stopped || !toolName) return;
      tool = { toolName, args };
      // The tool is now the current step; earlier reasoning led up to it.
      thinking = '';
      newThinkingChars = 0;
      // A tool's name + args already describe the step — emit a precise line
      // instantly with no LLM round-trip. Only fall back to the summarizer when
      // the tool is unrecognized.
      const signal = opts.toolSignal?.(toolName, args);
      if (signal) {
        if (signal !== lastEmitted) {
          lastEmitted = signal;
          opts.emit(signal);
        }
        return;
      }
      dirty = true;
      schedule();
    },
    stop() {
      stopped = true;
      if (timer) clearTimeout(timer);
      timer = null;
    },
  };
}
