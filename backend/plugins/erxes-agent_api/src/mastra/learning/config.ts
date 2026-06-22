// ---------------------------------------------------------------------------
// Agent Learning — configuration (pure, env-driven).
//
// Mirrors mastra/memory/config.ts and mastra/knowledge/config.ts: injectable
// `env` map, no I/O. The learning feature shares the Qdrant + embedder
// configuration with advanced memory but has its own master switch and its
// own Qdrant collection (the tenant's distilled "Agent knowledge").
//
// See docs/LEARNING-SYSTEM.md.
// ---------------------------------------------------------------------------

import { createHmac } from 'crypto';
import {
  Env,
  val,
  parsePositiveInt,
  parseScore,
  collectionName as buildCollectionName,
  enabledBy,
  canonicalTenant,
  buildVectorStatus,
} from '~/mastra/configEnv';
import {
  resolveEmbedderConfig,
  qdrantUrl,
  qdrantApiKey,
} from '~/mastra/memory/config';

export { resolveEmbedderConfig, qdrantUrl, qdrantApiKey };
export type { Env };

export interface LearningTuning {
  // Auto-promotion floors: a candidate becomes approved only when BOTH hold.
  // minSources is the k-anonymity floor — a lesson must be independently
  // derived from at least k distinct people before it can auto-promote.
  autoPromoteMinSources: number;
  autoPromoteMinConfidence: number;
  // Retrieval knobs for the agent-knowledge tool.
  topK: number;
  minScore: number;
  // Dedupe: similarity above this merges a candidate into the existing lesson.
  mergeScore: number;
  // Prompt digest budget (characters) and entry cap.
  digestMaxChars: number;
  digestMaxEntries: number;
  // A thread is distilled once idle this long with undistilled messages.
  idleMinutes: number;
  // Hygiene: confidence decay after this many days without reinforcement,
  // and the floor below which an unpinned learning is archived.
  decayDays: number;
  decayFactor: number;
  archiveBelowConfidence: number;
  // Feedback reinforcement deltas (down votes weigh more than up votes).
  feedbackUpDelta: number;
  feedbackDownDelta: number;
}

/**
 * The master switch. Learning is enabled ONLY when ERXES_AGENT_LEARNING is
 * exactly "enable" — same unambiguous contract as ERXES_AGENT_MEMORY /
 * ERXES_AGENT_KNOWLEDGE, independent of both.
 */
export function isLearningEnabled(env: Env = process.env): boolean {
  return enabledBy(env, 'ERXES_AGENT_LEARNING');
}

/** Qdrant collection for distilled learnings, separate from memory/knowledge. */
export function learningCollectionName(
  model: string,
  dimension: number,
): string {
  return buildCollectionName('mastra_learnings', model, dimension);
}

/** All learning knobs with safe defaults; invalid env values are ignored. */
export function resolveLearningTuning(env: Env = process.env): LearningTuning {
  return {
    autoPromoteMinSources: parsePositiveInt(
      val(env, 'ERXES_AGENT_LEARNING_K'),
      3,
    ),
    autoPromoteMinConfidence: parseScore(
      val(env, 'ERXES_AGENT_LEARNING_MIN_CONF'),
      0.75,
    ),
    topK: parsePositiveInt(val(env, 'ERXES_AGENT_LEARNING_TOPK'), 4),
    minScore: parseScore(val(env, 'ERXES_AGENT_LEARNING_MIN_SCORE'), 0.5),
    mergeScore: parseScore(val(env, 'ERXES_AGENT_LEARNING_MERGE_SCORE'), 0.9),
    digestMaxChars: parsePositiveInt(
      val(env, 'ERXES_AGENT_LEARNING_DIGEST_CHARS'),
      2400,
    ),
    digestMaxEntries: parsePositiveInt(
      val(env, 'ERXES_AGENT_LEARNING_DIGEST_ENTRIES'),
      12,
    ),
    idleMinutes: parsePositiveInt(
      val(env, 'ERXES_AGENT_LEARNING_IDLE_MINUTES'),
      30,
    ),
    decayDays: parsePositiveInt(
      val(env, 'ERXES_AGENT_LEARNING_DECAY_DAYS'),
      30,
    ),
    decayFactor: parseScore(val(env, 'ERXES_AGENT_LEARNING_DECAY_FACTOR'), 0.9),
    archiveBelowConfidence: parseScore(
      val(env, 'ERXES_AGENT_LEARNING_ARCHIVE_BELOW'),
      0.2,
    ),
    feedbackUpDelta: 0.05,
    feedbackDownDelta: -0.1,
  };
}

/** Cron pattern for the distillation + hygiene sweep (BullMQ job scheduler). */
export function learningSweepCron(env: Env = process.env): string {
  return val(env, 'ERXES_AGENT_LEARNING_SWEEP_CRON') || '*/10 * * * *';
}

/**
 * Canonical tenant tag for Qdrant points and filters — same convention as
 * company knowledge: saas → org subdomain, non-saas → fixed 'os'.
 */
export function learningTenant(
  requestSubdomain: string | undefined,
  env: Env = process.env,
): string | undefined {
  return canonicalTenant(env, requestSubdomain);
}

/**
 * Pseudonymize a contributor's resourceId for sourceHashes. HMAC so the
 * stored value can count distinct people and propagate erasure, but can't be
 * reversed to an identity. The secret is deployment-local; the default keeps
 * the feature usable out of the box (pseudonymization, not secrecy, is the
 * goal — raw ids never leave the personal tier either way).
 */
export function hashSource(resourceId: string, env: Env = process.env): string {
  const secret =
    val(env, 'ERXES_AGENT_LEARNING_HASH_SECRET') || 'erxes-agent-learning';
  return createHmac('sha256', secret)
    .update(resourceId)
    .digest('hex')
    .slice(0, 32);
}

export interface LearningStatus {
  enabled: boolean;
  embedder: string | null;
  embedderModel: string | null;
  qdrantUrl: string | null;
  collection: string | null;
  autoPromoteMinSources: number | null;
  autoPromoteMinConfidence: number | null;
}

/** Read-only status surfaced in the UI. All nulls when disabled. */
export function computeLearningStatus(env: Env = process.env): LearningStatus {
  if (!isLearningEnabled(env)) {
    return {
      enabled: false,
      embedder: null,
      embedderModel: null,
      qdrantUrl: null,
      collection: null,
      autoPromoteMinSources: null,
      autoPromoteMinConfidence: null,
    };
  }
  const emb = resolveEmbedderConfig(env);
  const tuning = resolveLearningTuning(env);
  return {
    ...buildVectorStatus('mastra_learnings', emb, qdrantUrl(env)),
    enabled: true,
    autoPromoteMinSources: tuning.autoPromoteMinSources,
    autoPromoteMinConfidence: tuning.autoPromoteMinConfidence,
  };
}
