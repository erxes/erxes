// ---------------------------------------------------------------------------
// Agent Learning — distillation orchestrator.
//
// One thread in, zero-or-more shared lessons out:
//   extract + PII-redact (LLM: distiller agent with a PIIDetector output
//   processor) → dedupe against the existing corpus (merge evidence) → store
//   candidate → auto-promote when the k-anonymity + confidence floors are met.
//
// The contributor is recorded only as HMAC(thread owner id) — identity never
// reaches the shared tier.
// ---------------------------------------------------------------------------

import { IModels } from '~/connectionResolvers';
import { IMastraLearningDocument } from '@/learning/@types/learning';
import { hashSource, resolveLearningTuning } from './config';
import {
  buildTranscript,
  extractCandidates,
  ExtractionRuntime,
  TranscriptMessage,
} from './extractor';
import {
  indexLearning,
  searchLearnings,
  setLearningVectorStatus,
} from './store';

export interface DistillResult {
  extracted: number;
  gated: number;
  merged: number;
  created: number;
  promoted: number;
}

/** Promote a candidate when both floors hold. Best-effort vector sync. */
async function maybeAutoPromote(
  models: IModels,
  tenant: string,
  learning: IMastraLearningDocument | null,
): Promise<boolean> {
  if (!learning || learning.status !== 'candidate') return false;
  const tuning = resolveLearningTuning();
  const distinctSources = learning.sourceHashes?.length ?? 0;
  if (
    distinctSources < tuning.autoPromoteMinSources ||
    (learning.confidence ?? 0) < tuning.autoPromoteMinConfidence
  ) {
    return false;
  }
  await models.MastraLearning.setStatus(String(learning._id), 'approved');
  try {
    await setLearningVectorStatus(tenant, String(learning._id), 'approved');
  } catch {
    // converged later by the sweep's status reconciliation
  }
  return true;
}

/**
 * Distill the undistilled tail of one thread into the shared knowledge tier.
 * Throws only on extractor failure (the caller skips the cursor update so the
 * thread is retried next sweep); per-candidate failures are contained.
 */
export async function distillThread(params: {
  models: IModels;
  tenant: string; // canonical Qdrant tenant tag (learningTenant())
  agentId: string;
  ownerResourceId: string; // thread owner — hashed before storage
  messages: TranscriptMessage[];
  runtime: ExtractionRuntime;
  outcome?: string;
}): Promise<DistillResult> {
  const {
    models,
    tenant,
    agentId,
    ownerResourceId,
    messages,
    runtime,
    outcome,
  } = params;
  const result: DistillResult = {
    extracted: 0,
    gated: 0,
    merged: 0,
    created: 0,
    promoted: 0,
  };

  const transcript = buildTranscript(messages);
  if (!transcript.trim()) return result;

  // 1. Extract candidates. The distiller agent runs a Mastra PIIDetector output
  //    processor, so every statement is already PII-redacted on the way out —
  //    no raw identifier survives past this point, even in logs.
  const candidates = await extractCandidates(transcript, runtime, outcome);
  result.extracted = candidates.length;
  if (!candidates.length) return result;

  const sourceHash = hashSource(ownerResourceId);
  const tuning = resolveLearningTuning();

  for (const candidate of candidates) {
    try {
      // 3. Dedupe against candidates AND approved lessons — a re-derived
      //    lesson merges (evidence++, contributor recorded) instead of
      //    duplicating, which is also what feeds the k-anonymity counter.
      const [similar] = await searchLearnings(tenant, candidate.statement, {
        topK: 1,
        minScore: tuning.mergeScore,
        statuses: ['candidate', 'approved'],
      });

      if (similar?.learningId) {
        const merged = await models.MastraLearning.mergeEvidence(
          similar.learningId,
          { confidence: candidate.confidence, sourceHash },
        );
        result.merged++;
        if (await maybeAutoPromote(models, tenant, merged)) result.promoted++;
        continue;
      }

      // 4. New lesson — stored as a candidate, invisible to live turns until
      //    promoted (curation UI or the floors).
      const created = await models.MastraLearning.createLearning({
        statement: candidate.statement,
        type: candidate.type,
        contextTags: candidate.contextTags,
        agentId,
        status: 'candidate',
        confidence: candidate.confidence,
        evidenceCount: 1,
        sourceHashes: [sourceHash],
        createdBy: 'system',
      });
      await indexLearning(tenant, created);
      result.created++;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`[mastra:learning] candidate skipped: ${e?.message || e}`);
    }
  }

  return result;
}
