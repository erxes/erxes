// ---------------------------------------------------------------------------
// Agent Learning — distillation extractor.
//
// A stateless, tool-less agent (same pattern as the working-memory extractor)
// reads a finished/idle conversation and emits candidate learnings as JSON.
// The routing rule lives in the prompt: person-specific facts belong to
// working memory (handled elsewhere) and must NOT be emitted here — only
// lessons that hold for every user of the organization.
//
// Pure prompt/parse halves are exported for unit testing.
// ---------------------------------------------------------------------------

import { MastraLearningType } from '@/learning/@types/learning';
import type { ProviderDocLike } from '~/mastra/providers';

export interface CandidateLearning {
  type: MastraLearningType;
  statement: string;
  contextTags: string[];
  confidence: number;
}

export const LEARNING_TYPES: MastraLearningType[] = [
  'faq',
  'procedure',
  'pitfall',
  'product-fact',
  'preference',
];

export const DISTILLER_INSTRUCTIONS = `You distill reusable lessons from one finished support/assistant conversation into a SHARED knowledge base read by many different users.

Extract ONLY lessons that are true for the whole organization, regardless of who asked:
- faq: a question users keep asking, phrased generally, with its answer
- procedure: steps that solved a problem (especially if the user confirmed the fix worked)
- pitfall: something that failed, a wrong assumption, or a user correction ("no, actually...")
- product-fact: a stable fact about the product, plan, pricing, or configuration
- preference: an organization-wide convention (NEVER one person's preference)

Hard rules:
- NEVER include names, emails, phone numbers, ids, account details, or anything that could identify a person. Facts about a specific individual belong in their private profile, not here — skip them entirely.
- Paraphrase. Do not quote messages verbatim.
- Generalize: "Customers asking about X should be told Y", not "Tell Batbold Y".
- Skip small talk, one-off context, and anything you are unsure generalizes.
- An empty list is a good answer when the conversation taught nothing reusable.

Output ONLY a JSON array (possibly empty) of objects:
[{"type":"faq|procedure|pitfall|product-fact|preference","statement":"...","contextTags":["tag1","tag2"],"confidence":0.0-1.0}]
No commentary, no code fences.`;

export interface TranscriptMessage {
  role: string;
  content: string;
}

/** Render the undistilled tail of a thread as a plain transcript. */
export function buildTranscript(
  messages: TranscriptMessage[],
  maxChars = 24_000,
): string {
  const lines = messages
    .filter((m) => (m.content ?? '').trim())
    .map(
      (m) =>
        `${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content.trim()}`,
    );
  let transcript = lines.join('\n');
  if (transcript.length > maxChars) {
    transcript = transcript.slice(transcript.length - maxChars);
  }
  return transcript;
}

/** Render the distillation prompt body (transcript + optional outcome). */
export function buildDistillUserContent(
  transcript: string,
  outcome?: string,
): string {
  return [
    'Conversation transcript:',
    transcript,
    ...(outcome ? ['', `Outcome signal: ${outcome}`] : []),
    '',
    'Output the JSON array of candidate lessons.',
  ].join('\n');
}

/** Coerce the extractor's confidence into [0, 1]; non-numeric → 0.5. */
function clampConfidence(value: unknown): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0.5;
  return Math.min(1, Math.max(0, num));
}

/**
 * Parse extractor output into validated candidates. Tolerant of surrounding
 * prose/fences (finds the first JSON array), strict about entry shape:
 * unknown types and empty statements are dropped, never guessed.
 */
export function parseCandidates(raw: string): CandidateLearning[] {
  let arr: unknown;
  try {
    const text = raw ?? '';
    const open = text.indexOf('[');
    const close = text.lastIndexOf(']');
    if (open === -1 || close <= open) return [];
    arr = JSON.parse(text.slice(open, close + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];

  const out: CandidateLearning[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const statement = String(item.statement ?? '').trim();
    const type = String(item.type ?? '').trim() as MastraLearningType;
    if (!statement || statement.length > 1000) continue;
    if (!LEARNING_TYPES.includes(type)) continue;
    const tags = Array.isArray(item.contextTags)
      ? item.contextTags
          .map((tag: unknown) => String(tag).trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 5)
      : [];
    out.push({
      type,
      statement,
      contextTags: tags,
      confidence: clampConfidence(item.confidence),
    });
  }
  return out.slice(0, 10);
}

// ── Stateless agent plumbing (lazy, cached per provider+model) ───────────────

// The minimal surface this module needs from a Mastra Agent. Keeping it local
// avoids a static @mastra/core type dependency in a lazily-loaded path.
interface StatelessAgent {
  generate(msgs: unknown, opts?: unknown): Promise<{ text?: string }>;
  generateLegacy(msgs: unknown): Promise<{ text?: string }>;
}

const _agents = new Map<string, StatelessAgent>();

/** Lazily build (and cache per provider+model) a tool-less one-shot agent. */
async function statelessAgent(
  id: string,
  name: string,
  instructions: string,
  provider: string,
  model: string,
  providers: ProviderDocLike[],
): Promise<StatelessAgent> {
  const key = `${id}:${provider}:${model}`;
  let cached = _agents.get(key);
  if (!cached) {
    const { Agent } = await import('@mastra/core/agent');
    const { buildModel } = await import('~/mastra/providers');
    cached = new Agent({
      id,
      name,
      instructions,
      model: buildModel(provider, model, providers),
    }) as unknown as StatelessAgent;
    _agents.set(key, cached);
  }
  return cached;
}

export interface ExtractionRuntime {
  provider: string;
  model: string;
  providers: ProviderDocLike[];
  authCtx: { userHeader?: string; token?: string; subdomain?: string };
  isLegacy: boolean;
}

/** One single-turn generate under the request's auth context; returns text. */
async function runStateless(
  agent: StatelessAgent,
  userContent: string,
  rt: ExtractionRuntime,
): Promise<string> {
  const { runWithAuth } = await import('~/mastra/requestContext');
  const msgs = [{ role: 'user', content: userContent }];
  const result = await runWithAuth(rt.authCtx, () =>
    rt.isLegacy
      ? agent.generateLegacy(msgs)
      : agent.generate(msgs, { maxSteps: 1 }),
  );
  return result?.text ?? '';
}

/** Distill one transcript into candidate learnings. Throws on LLM failure. */
export async function extractCandidates(
  transcript: string,
  rt: ExtractionRuntime,
  outcome?: string,
): Promise<CandidateLearning[]> {
  const agent = await statelessAgent(
    'mastra-learning-distiller',
    'Learning Distiller',
    DISTILLER_INSTRUCTIONS,
    rt.provider,
    rt.model,
    rt.providers,
  );
  const text = await runStateless(
    agent,
    buildDistillUserContent(transcript, outcome),
    rt,
  );
  return parseCandidates(text);
}

/** Run the LLM privacy gate over candidate statements. Fail-closed. */
export async function gateCandidates(
  statements: string[],
  rt: ExtractionRuntime,
): Promise<boolean[]> {
  if (!statements.length) return [];
  const { PRIVACY_GATE_INSTRUCTIONS, buildGateUserContent, parseGateVerdicts } =
    await import('./sanitize');
  const agent = await statelessAgent(
    'mastra-learning-privacy-gate',
    'Learning Privacy Gate',
    PRIVACY_GATE_INSTRUCTIONS,
    rt.provider,
    rt.model,
    rt.providers,
  );
  try {
    const text = await runStateless(
      agent,
      buildGateUserContent(statements),
      rt,
    );
    return parseGateVerdicts(text, statements.length);
  } catch {
    return new Array(statements.length).fill(false);
  }
}
