import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/modules/campaign/constants';

export interface ISpinCampaignParams {
  searchValue?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}

/* -------------------- filter -------------------- */

const generateFilter = (params: ISpinCampaignParams) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

/* -------------------- queries -------------------- */

export const spinCampaignQueries = {
  getSpinCampaigns: async (
    _parent: undefined,
    params: ISpinCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.SpinCampaign,
      params,
      query: filter,
    });
  },

  getSpinCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.SpinCampaign.getSpinCampaign(_id);
  },

  getActiveSpinCampaigns: async (
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) => {
    const now = new Date();

    return models.SpinCampaign.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },
};
