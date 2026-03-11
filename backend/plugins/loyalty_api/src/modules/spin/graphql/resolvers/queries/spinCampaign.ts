import {
  ISpinCampaignDocument,
  ISpinCampaignParams,
} from '@/spin/@types/spinCampaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: ISpinCampaignParams) => {
  const filter: FilterQuery<ISpinCampaignDocument> = {};

  if (params.searchValue) {
    filter.title = new RegExp(params.searchValue);
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const spinCampaignQueries = {
  async spinCampaigns(
    _root: undefined,
    params: ISpinCampaignParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<ISpinCampaignDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.SpinCampaigns,
      params,
      query: filter,
    });
  },

  async spinCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.SpinCampaigns.getSpinCampaign(_id);
  },

  async cpSpinCampaigns(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const now = new Date();

    return models.SpinCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },
};
