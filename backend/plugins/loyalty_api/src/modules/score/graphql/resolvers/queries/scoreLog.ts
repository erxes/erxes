import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IScoreLogParams } from '~/modules/score/@types/scoreLog';

const generateFilter = (params: IScoreLogParams) => {
  const filter: any = {};

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.action) {
    filter.action = params.action;
  }

  if (params.contentId) {
    filter.contentId = params.contentId;
  }

  if (params.contentType) {
    filter.contentType = params.contentType;
  }

  return filter;
};

export const scoreLogQueries = {
  getScoreLogs: async (
    _parent: undefined,
    params: IScoreLogParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.ScoreLog,
      params,
      query: filter,
    });
  },
};
