import {
  IDonateCampaignDocument,
  IDonateCampaignParams,
} from '@/donate/@types/donateCampaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: IDonateCampaignParams) => {
  const filter: FilterQuery<IDonateCampaignDocument> = {};

  if (params.searchValue) {
    filter.name = new RegExp(params.searchValue, 'i');
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

export const donateCampaignQueries = {
  async donateCampaigns(
    _root: undefined,
    params: IDonateCampaignParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<IDonateCampaignDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.DonateCampaigns,
      params,
      query: filter,
    });
  },

  async cpDonateCampaigns(
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ) {
    const now = new Date();

    return models.DonateCampaigns.find({
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ modifiedAt: -1 });
  },

  async donateCampaignDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.DonateCampaigns.getDonateCampaign(_id);
  },
};
