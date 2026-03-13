import {
  ILotteryCampaignDocument,
  ILotteryCampaignParams,
} from '@/lottery/@types/lotteryCampaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: ILotteryCampaignParams) => {
  const filter: FilterQuery<ILotteryCampaignDocument> = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const lotteryCampaignQueries = {
  async lotteryCampaigns(
    _root: undefined,
    params: ILotteryCampaignParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    return cursorPaginate({
      model: models.LotteryCampaigns,
      params,
      query: filter,
    });
  },

  async cpLotteryCampaigns(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const now = new Date();

    return models.LotteryCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async lotteryCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.getLotteryCampaign(_id);
  },

  async lotteryCampaignWinnerList(
    _root: undefined,
    params: ILotteryCampaignParams,
    { models }: IContext,
  ) {
    const { awardId, campaignId } = params;

    return cursorPaginate({
      model: models.Lotteries,
      params,
      query: {
        campaignId: campaignId,
        awardId: awardId,
        status: 'won',
      },
    });
  },

  async lotteriesCampaignCustomerList(
    _root: undefined,
    params: ILotteryCampaignParams,
    { models }: IContext,
  ) {
    const { campaignId } = params;

    return cursorPaginate({
      model: models.Lotteries,
      params,
      query: {
        campaignId: campaignId,
        status: 'new',
      },
    });
  },
};
