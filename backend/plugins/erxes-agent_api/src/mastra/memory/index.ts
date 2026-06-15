// ---------------------------------------------------------------------------
// Advanced Memory — façade.
//
// Public surface for the rest of the plugin. Boot initialization lives here;
// state and behavior are delegated to focused modules and re-exported.
// ---------------------------------------------------------------------------

import {
  isAdvancedMemoryEnabled,
  resolveEmbedderConfig,
  collectionName,
  qdrantUrl,
} from './config';
import { health, ensureCollection } from './vectorStore';
import { setMemoryHealth } from './health';

export { getMemoryHealth, refreshMemoryHealth } from './health';
export { augmentConvo, deriveResourceId, deriveBotResourceId } from './convo';
export {
  recallBlock,
  indexMessages,
  buildRecallFilter,
  toPoint,
  formatRecallBlock,
  filterHitsByScore,
  pointIdFor,
} from './semanticRecall';
export {
  readWorkingMemory,
  refreshWorkingMemory,
  buildWorkingMemoryBlock,
  mergeWorkingMemory,
  buildRefreshPrompt,
  buildRefreshUserContent,
  WM_EXTRACTOR_INSTRUCTIONS,
} from './workingMemory';
export type { MemoryContext, IndexableMessage } from './semanticRecall';
export type { ConvoMessage } from './convo';

/**
 * Boot hook. When advanced memory is enabled: ping Qdrant and ensure the
 * collection exists. Never throws — on failure it logs loudly and leaves the
 * feature degraded (per-request code falls back to recent-history replay).
 */
export async function initAdvancedMemory(): Promise<void> {
  if (!isAdvancedMemoryEnabled()) return;

  const emb = resolveEmbedderConfig();
  const collection = collectionName(emb.model, emb.dimension);
  const url = qdrantUrl();

  const reachable = await health();
  setMemoryHealth(reachable);
  if (!reachable) {
    // eslint-disable-next-line no-console
    console.warn(
      `[mastra:memory] Advanced memory is ENABLED but Qdrant is unreachable at ${url}. ` +
        'Recall is skipped until it recovers. Start it with: ' +
        'docker compose -f backend/plugins/erxes-agent_api/docker-compose.yml up -d',
    );
    return;
  }

  try {
    await ensureCollection(collection, emb.dimension);
    // eslint-disable-next-line no-console
    console.log(
      `[mastra:memory] Advanced memory ready — collection "${collection}" ` +
        `(dim ${emb.dimension}, embedder ${emb.kind}/${emb.model}) at ${url}.`,
    );
  } catch (e) {
    setMemoryHealth(false);
    // eslint-disable-next-line no-console
    console.error(
      `[mastra:memory] ensureCollection failed: ${e?.message || e}`,
    );
  }
}
