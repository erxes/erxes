import { IScoreLogParams } from '@/score/@types/scoreLog';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const scoreLogQueries = {
  async scoreLogs(
    _root: undefined,
    params: IScoreLogParams,
    { models }: IContext,
  ) {
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

    return cursorPaginate({
      model: models.ScoreLogs,
      params: { ...params, orderBy: { createdAt: -1 } },
      query: filter,
    });
  },

  async scoreLogList(
    _root: undefined,
    params: IScoreLogParams,
    { models }: IContext,
  ) {
    return models.ScoreLogs.getScoreLogs(params);
  },

  async scoreLogStatistics(
    _root: undefined,
    params: IScoreLogParams,
    { models }: IContext,
  ) {
    return models.ScoreLogs.getStatistic(params);
  },
};
