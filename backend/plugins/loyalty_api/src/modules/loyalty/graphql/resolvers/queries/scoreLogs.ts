import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IScoreParams } from '~/modules/loyalty/@types/common';

const scoreLogQueries = {
  async scoreLogs(_root, params: any, { models }: IContext) {
    const { ownerType, ownerId, searchValue, campaignId, action } = params;
    const filter: any = {};

    if (ownerType) {
      filter.ownerType = ownerType;
    }

    if (ownerId) {
      filter.ownerId = ownerId;
    }

    if (searchValue) {
      filter.description = searchValue;
    }

    if (campaignId) {
      filter.campaignId = campaignId;
    }

    if (action) {
      filter.action = action;
    }

    return paginate(
      models.ScoreLogs.find(filter).sort({ createdAt: -1 }),
      params,
    );
  },
  async scoreLogList(_root, params: IScoreParams, { models }: IContext) {
    const result = models.ScoreLogs.getScoreLogs(params);
    return result;
  },
  async scoreLogStatistics(_root, params: IScoreParams, { models }: IContext) {
    const result = models.ScoreLogs.getStatistic(params);
    return result;
  },
};

export default scoreLogQueries;
