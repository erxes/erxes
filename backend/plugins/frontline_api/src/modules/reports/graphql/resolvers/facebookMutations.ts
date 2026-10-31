import { publishReportUpdate } from '@/reports/realtime';
import { IContext } from '~/connectionResolvers';
import { syncFacebookPostStats } from '@/reports/facebookSyncService';

export const reportFacebookMutations = {
  async reportFacebookSyncPostStats(
    _parent: undefined,
    { pageIds, limit }: { pageIds?: string[]; limit?: number },
    { models, user, subdomain }: IContext,
  ) {
    if (!user?._id) {
      throw new Error('Login required');
    }

    const result = await syncFacebookPostStats({ models, pageIds, limit });
    await publishReportUpdate(subdomain, ['facebook']);
    return result;
  },
};
