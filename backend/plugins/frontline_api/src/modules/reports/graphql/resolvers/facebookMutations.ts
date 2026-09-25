import { IContext } from '~/connectionResolvers';
import { syncFacebookPostStats } from '@/reports/facebookSyncService';

export const reportFacebookMutations = {
  async reportFacebookSyncPostStats(
    _parent: undefined,
    { pageIds, limit }: { pageIds?: string[]; limit?: number },
    { models, user }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    return syncFacebookPostStats({ models, pageIds, limit });
  },
};
