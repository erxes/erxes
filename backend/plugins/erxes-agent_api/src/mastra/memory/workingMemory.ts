// ---------------------------------------------------------------------------
// Advanced Memory — working memory.
//
// A persistent, per-(user, agent) profile stored in MongoDB. Read each turn and
// injected as a `system` context block; refreshed AFTER the turn by a small,
// stateless extraction call (markdown replace semantics). No Qdrant involved.
//
// The refresh uses a dedicated, tool-less extractor agent so it can never emit a
// tool call — keeping the exchange clean and Kimi-safe.
// ---------------------------------------------------------------------------

// Heavy deps (@mastra/core/agent, the provider/model builder, the auth context)
// are imported lazily inside refreshWorkingMemory so the pure helpers stay
// dependency-light and unit-testable, and default deployments never load them.
// Type-only imports are erased at runtime, so they keep that contract.
import type { IModels } from '~/connectionResolvers';
import type { ProviderDocLike } from '~/mastra/providers';
import type { MemoryContext } from './semanticRecall';
import type { ConvoMessage } from './convo';

export const WM_EXTRACTOR_INSTRUCTIONS = `You maintain a concise, durable profile of a single user for an AI assistant.
Given the current profile and the latest exchange, output the COMPLETE updated profile in markdown.
Rules:
- Keep only durable, useful facts: name, location, timezone, role, preferences, ongoing goals, key constraints.
- Do NOT store one-off questions, transient details, or the assistant's answers.
- Merge new facts with existing ones; correct outdated facts; keep it short (bullet points).
- If nothing should change, output the current profile unchanged.
- Output ONLY the profile markdown — no preamble, no commentary, no code fences.`;

// ── Pure helpers ─────────────────────────────────────────────────────────────

/** Wrap the profile as a `system` context block, or null when empty. */
export function buildWorkingMemoryBlock(
  content: string | null | undefined,
): string | null {
  const profile = (content ?? '').trim();
  if (!profile) return null;
  return `What you know about this user (from earlier sessions):\n${profile}`;
}

/** Markdown replace semantics: a non-empty update wins; otherwise keep existing. */
export function mergeWorkingMemory(
  existing: string,
  update: string | null | undefined,
): string {
  const updated = (update ?? '').trim();
  return updated || (existing ?? '');
}

/** Render the extractor's user message: current profile + latest exchange. */
export function buildRefreshUserContent(
  existing: string,
  exchange: { user: string; assistant: string },
): string {
  return [
    'Current profile:',
    (existing ?? '').trim() || '(empty)',
    '',
    'Latest exchange:',
    `User: ${exchange.user}`,
    `Assistant: ${exchange.assistant}`,
    '',
    'Output the complete updated profile in markdown.',
  ].join('\n');
}

/** The (stateless) extraction prompt — system + user only, no tool frames. */
export function buildRefreshPrompt(
  existing: string,
  exchange: { user: string; assistant: string },
): ConvoMessage[] {
  return [
    { role: 'system', content: WM_EXTRACTOR_INSTRUCTIONS },
    { role: 'user', content: buildRefreshUserContent(existing, exchange) },
  ];
}

// ── Orchestration (best-effort; never throws) ────────────────────────────────

let _warned = false;
/** Log a degradation warning once per process (the refresh is best-effort). */
function warnOnce(msg: string) {
  if (_warned) return;
  // eslint-disable-next-line no-console
  console.warn(msg);
  _warned = true;
}

/** Read the stored profile and return it as a context block (or null). */
export async function readWorkingMemory(
  models: IModels,
  ctx: MemoryContext,
): Promise<string | null> {
  try {
    const content = await models.MastraWorkingMemory.getContent(
      ctx.resourceId,
      ctx.agentId,
    );
    return buildWorkingMemoryBlock(content);
  } catch (e) {
    warnOnce(`[mastra:memory] working-memory read skipped: ${e?.message || e}`);
    return null;
  }
}

// The minimal surface used from a Mastra Agent — typed locally so the lazy
// import keeps this module free of a static @mastra/core type dependency.
interface ExtractorAgent {
  generate(msgs: unknown, opts?: unknown): Promise<{ text?: string }>;
}

// Tool-less extractor agents, cached per provider+model. Built lazily so the
// Mastra Agent / provider deps are only loaded when a refresh actually runs.
const _extractors = new Map<string, ExtractorAgent>();

/** Lazily build (and cache per provider+model) the profile extractor agent. */
async function extractorFor(
  provider: string,
  model: string,
  providers: ProviderDocLike[],
): Promise<ExtractorAgent> {
  const key = `${provider}:${model}`;
  let cached = _extractors.get(key);
  if (!cached) {
    const { Agent } = await import('@mastra/core/agent');
    const { buildModel } = await import('~/mastra/providers');
    cached = new Agent({
      id: 'mastra-wm-extractor',
      name: 'Working Memory Extractor',
      instructions: WM_EXTRACTOR_INSTRUCTIONS,
      model: buildModel(provider, model, providers),
    }) as unknown as ExtractorAgent;
    _extractors.set(key, cached);
  }
  return cached;
}

/**
 * Update the profile from the latest exchange. Best-effort and intended to run
 * fire-and-forget after the reply is returned, so it never adds chat latency.
 */
export async function refreshWorkingMemory(params: {
  models: IModels;
  ctx: MemoryContext;
  exchange: { user: string; assistant: string };
  provider: string;
  model: string;
  providers: ProviderDocLike[];
  authCtx: { userHeader?: string; token?: string; subdomain?: string };
}): Promise<void> {
  const { models, ctx, exchange, provider, model, providers, authCtx } =
    params;
  try {
    const existing = await models.MastraWorkingMemory.getContent(
      ctx.resourceId,
      ctx.agentId,
    );
    const { runWithAuth } = await import('~/mastra/requestContext');
    const extractor = await extractorFor(provider, model, providers);
    const msgs = [
      { role: 'user', content: buildRefreshUserContent(existing, exchange) },
    ];
    const result = await runWithAuth(authCtx, () =>
      extractor.generate(msgs, { maxSteps: 1 }),
    );
    const updated = mergeWorkingMemory(existing, result?.text);
    if (updated.trim() && updated !== existing) {
      await models.MastraWorkingMemory.saveMemory(
        ctx.resourceId,
        ctx.agentId,
        updated,
      );
    }
  } catch (e) {
    warnOnce(
      `[mastra:memory] working-memory refresh skipped: ${e?.message || e}`,
    );
  }
}
