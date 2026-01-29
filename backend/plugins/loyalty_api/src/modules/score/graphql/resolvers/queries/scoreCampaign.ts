import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { SCORE_CAMPAIGN_STATUSES } from '~/modules/score/constants';

/* -------------------- params -------------------- */

export interface IScoreCampaignParams {
  status?: string;
  searchValue?: string;
  serviceName?: string;
  limit?: number;
  cursor?: string;
}

/* -------------------- filter -------------------- */

const generateFilter = (params: IScoreCampaignParams) => {
  const filter: any = {
    status: { $ne: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
  };

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.serviceName) {
    filter.serviceName = params.serviceName;
  }

  return filter;
};

/* -------------------- queries -------------------- */

export const scoreCampaignQueries = {
  getScoreCampaigns: async (
    _parent: undefined,
    params: IScoreCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.ScoreCampaign,
      params,
      query: filter,
    });
  },

  getScoreCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.ScoreCampaign.getScoreCampaign(_id);
  },
};
