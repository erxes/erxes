// ---------------------------------------------------------------------------
// Agent Learning — prompt digest.
//
// A compact `system` context block of the tenant's best approved lessons,
// injected each turn alongside working memory / recall. Pinned lessons always
// lead; the rest rank by confidence × evidence. Budgeted in characters so a
// large corpus can't crowd out the conversation. Returns the injected ids so
// the turn can stamp meta.learningIdsInContext for feedback attribution.
// ---------------------------------------------------------------------------

import { IModels } from '~/connectionResolvers';
import { isLearningEnabled, resolveLearningTuning } from './config';

export interface LearnedDigest {
  block: string;
  ids: string[];
}

export interface DigestEntry {
  _id: string;
  statement: string;
  type: string;
  pinned?: boolean;
  confidence?: number;
  evidenceCount?: number;
}

/** Pure: rank + budget entries into the digest block. Exported for tests. */
export function buildDigestBlock(
  entries: DigestEntry[],
  opts: { maxChars: number; maxEntries: number },
): LearnedDigest | null {
  const ranked = [...entries].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const scoreA = (a.confidence ?? 0) * Math.log2(1 + (a.evidenceCount ?? 1));
    const scoreB = (b.confidence ?? 0) * Math.log2(1 + (b.evidenceCount ?? 1));
    return scoreB - scoreA;
  });

  const header =
    'Lessons your organization has learned from past conversations (no personal ' +
    'data; if a lesson conflicts with current tool results, trust the tools):';
  const lines: string[] = [];
  const ids: string[] = [];
  let budget = opts.maxChars - header.length;

  for (const e of ranked) {
    if (ids.length >= opts.maxEntries) break;
    const line = `- [${e.type}] ${e.statement}`;
    if (line.length + 1 > budget) continue;
    lines.push(line);
    ids.push(String(e._id));
    budget -= line.length + 1;
  }

  if (!lines.length) return null;
  return { block: `${header}\n${lines.join('\n')}`, ids };
}

/**
 * Load the digest for one agent's turn — approved lessons that are either
 * tenant-wide (no agentId) or belong to this agent. Best-effort: any failure
 * returns null and the turn proceeds without a digest.
 */
export async function readLearnedDigest(
  models: IModels,
  agentId: string,
): Promise<LearnedDigest | null> {
  if (!isLearningEnabled()) return null;
  try {
    const tuning = resolveLearningTuning();
    const docs = await models.MastraLearning.find({
      status: 'approved',
      // null matches both missing and explicit-null agentId (tenant-wide).
      agentId: { $in: [null, '', agentId] },
    })
      .sort({ pinned: -1, confidence: -1 })
      .limit(tuning.digestMaxEntries * 3)
      .lean();

    return buildDigestBlock(docs as unknown as DigestEntry[], {
      maxChars: tuning.digestMaxChars,
      maxEntries: tuning.digestMaxEntries,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[mastra:learning] digest skipped: ${e?.message || e}`);
    return null;
  }
}
