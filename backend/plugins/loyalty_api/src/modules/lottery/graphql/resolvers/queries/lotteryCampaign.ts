import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface ILotteryCampaignParams {
  searchValue?: string;
  status?: string;
  limit?: number;
  cursor?: string;
}

const generateFilter = (params: ILotteryCampaignParams) => {
  const filter: any = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const lotteryCampaignQueries = {
  getLotteryCampaigns: async (
    _parent: undefined,
    params: ILotteryCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.LotteryCampaign, // ✅ singular
      params,
      query: filter,
    });
  },

  getActiveLotteryCampaigns: async (
    _parent: undefined,
    _params: {},
    { models }: IContext,
  ) => {
    const now = new Date();

    return models.LotteryCampaign.find({
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
  },

  getLotteryCampaignDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.LotteryCampaign.getLotteryCampaign(_id);
  },

  getLotteryCampaignWinnerList: async (
    _parent: undefined,
    params: {
      campaignId: string;
      awardId: string;
      limit?: number;
      cursor?: string;
    },
    { models }: IContext,
  ) => {
    return cursorPaginate({
      model: models.Lottery,
      params,
      query: {
        campaignId: params.campaignId,
        awardId: params.awardId,
        status: 'won',
      },
    });
  },

  getLotteryCampaignCustomerList: async (
    _parent: undefined,
    params: {
      campaignId: string;
      limit?: number;
      cursor?: string;
    },
    { models }: IContext,
  ) => {
    return cursorPaginate({
      model: models.Lottery,
      params,
      query: {
        campaignId: params.campaignId,
        status: 'new',
      },
    });
  },
};
