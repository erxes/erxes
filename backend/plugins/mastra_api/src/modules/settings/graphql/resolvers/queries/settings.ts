import { IContext } from '~/connectionResolvers';
import { computeAdvancedMemoryStatus } from '~/mastra/memory/config';
import { refreshMemoryHealth } from '~/mastra/memory';

export const settingsQueries = {
  mastraSettings: async (_: any, __: any, { models }: IContext) => {
    const doc = await models.MastraSettings.getSettings();
    const obj: any = doc?.toObject ? doc.toObject() : doc;

    // Read-only, env-derived status. Re-ping Qdrant live (2s-timeout, no-op when
    // disabled) so the connectivity dot reflects current state, not just boot.
    const reachable = await refreshMemoryHealth();
    const status = computeAdvancedMemoryStatus(process.env, { reachable });
    return {
      ...obj,
      advancedMemory: status.enabled,
      advancedMemoryStatus: status,
    };
  },
};
