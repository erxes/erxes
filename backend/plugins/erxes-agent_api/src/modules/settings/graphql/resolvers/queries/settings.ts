import { IContext } from '~/connectionResolvers';
import { computeAdvancedMemoryStatus } from '~/mastra/memory/config';
import { refreshMemoryHealth } from '~/mastra/memory';
import {
  computeKnowledgeStatus,
  isKnowledgeEnabled,
  enabledKnowledgeTypes,
} from '~/mastra/knowledge/config';
import { ALL_KNOWLEDGE_TYPE_NAMES } from '~/mastra/knowledge/contentTypes';
import { health as qdrantHealth } from '~/mastra/memory/vectorStore';
import { getStorageStatus } from '~/mastra/files/storage';
import { IModels } from '~/connectionResolvers';
import { IMastraSettings } from '@/settings/@types/settings';

// configured (core storage) AND the plugin toggle → attachments usable in chat.
export async function attachmentStorageStatus(
  models: IModels,
  subdomain: string,
) {
  const [settings, storage] = await Promise.all([
    models.MastraSettings.getSettings(),
    getStorageStatus(subdomain),
  ]);
  return {
    configured: storage.configured,
    serviceType: storage.serviceType,
    enabled: storage.configured && settings?.attachmentsEnabled !== false,
  };
}

/** Queries for plugin settings plus their derived feature-status blocks. */
export const settingsQueries = {
  // Lightweight status for the chat UI: decides whether the attach button shows.
  mastraAttachmentStorageStatus: (
    _parent: undefined,
    _args: undefined,
    { models, subdomain }: IContext,
  ) => {
    return attachmentStorageStatus(models, subdomain);
  },

  mastraSettings: async (
    _parent: undefined,
    _args: undefined,
    { models, subdomain }: IContext,
  ) => {
    const doc = await models.MastraSettings.getSettings();
    const obj: IMastraSettings = doc?.toObject ? doc.toObject() : doc;

    // Read-only, env-derived status. Re-ping Qdrant live (2s-timeout, no-op when
    // disabled) so the connectivity dot reflects current state, not just boot.
    const reachable = await refreshMemoryHealth();
    const status = computeAdvancedMemoryStatus(process.env, { reachable });

    // Company knowledge has its own flag, so it pings Qdrant independently of
    // the memory feature. Sweep counters come from the last reconciliation run.
    const knowledgeReachable = isKnowledgeEnabled()
      ? await qdrantHealth()
      : null;
    const knowledge = computeKnowledgeStatus(process.env, {
      reachable: knowledgeReachable,
    });

    return {
      ...obj,
      attachmentStorage: await attachmentStorageStatus(models, subdomain),
      advancedMemory: status.enabled,
      advancedMemoryStatus: status,
      knowledgeStatus: {
        ...knowledge,
        enabledTypes: isKnowledgeEnabled()
          ? enabledKnowledgeTypes(ALL_KNOWLEDGE_TYPE_NAMES)
          : [],
        lastSweepAt: obj?.knowledgeSyncStatus?.lastSweepAt ?? null,
        pointCount: obj?.knowledgeSyncStatus?.pointCount ?? null,
        types: obj?.knowledgeSyncStatus?.types ?? null,
        lastError: obj?.knowledgeSyncStatus?.lastError ?? null,
      },
    };
  },
};
