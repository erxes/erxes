import { IScoreLog } from '@/score/@types/scoreLog';
import { IContext } from '~/connectionResolvers';
import { fetchScoreTarget } from './_scoreTarget';

export default {
  change({ changeScore }: any) {
    return changeScore ?? null;
  },

  async campaign(
    { campaignId }: IScoreLog,
    _args: undefined,
    { models }: IContext,
  ) {
    return await models.ScoreCampaigns.findOne({ _id: campaignId });
  },

  type({ serviceName }: IScoreLog) {
    return serviceName || null;
  },

  async target(
    { targetId, serviceName }: IScoreLog,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return await fetchScoreTarget({ targetId, serviceName, subdomain });
  },
};
