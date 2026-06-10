import { IContext } from '~/connectionResolvers';
import { computeAdvancedMemoryStatus } from '~/mastra/memory/config';
import { refreshMemoryHealth } from '~/mastra/memory';
import { computeKnowledgeStatus, isKnowledgeEnabled } from '~/mastra/knowledge/config';
import { health as qdrantHealth } from '~/mastra/memory/vectorStore';

export const settingsQueries = {
  mastraSettings: async (_: any, __: any, { models }: IContext) => {
    const doc = await models.MastraSettings.getSettings();
    const obj: any = doc?.toObject ? doc.toObject() : doc;

    // Read-only, env-derived status. Re-ping Qdrant live (2s-timeout, no-op when
    // disabled) so the connectivity dot reflects current state, not just boot.
    const reachable = await refreshMemoryHealth();
    const status = computeAdvancedMemoryStatus(process.env, { reachable });

    // Company knowledge has its own flag, so it pings Qdrant independently of
    // the memory feature. Sweep counters come from the last reconciliation run.
    const knowledgeReachable = isKnowledgeEnabled() ? await qdrantHealth() : null;
    const knowledge = computeKnowledgeStatus(process.env, { reachable: knowledgeReachable });

    return {
      ...obj,
      advancedMemory: status.enabled,
      advancedMemoryStatus: status,
      knowledgeStatus: {
        ...knowledge,
        lastSweepAt: obj?.knowledgeSyncStatus?.lastSweepAt ?? null,
        articleCount: obj?.knowledgeSyncStatus?.articleCount ?? null,
        pointCount: obj?.knowledgeSyncStatus?.pointCount ?? null,
        lastError: obj?.knowledgeSyncStatus?.lastError ?? null,
      },
    };
  },
};
