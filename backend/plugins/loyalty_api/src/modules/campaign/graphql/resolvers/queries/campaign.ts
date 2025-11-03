import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICampaign, ICampaignParams } from '~/modules/campaign/@types';

const generateFilter = (params: ICampaignParams) => {
  const {
    kind,
    searchValue,
    status,
    fromDate,
    toDate,
    dateField = 'createdAt',
  } = params || {};

  const filter: FilterQuery<ICampaign> = { kind };

  if (searchValue) {
    filter.$or = [
      { name: { $regex: searchValue, $options: 'i' } },
      { description: { $regex: searchValue, $options: 'i' } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (fromDate || toDate) {
    filter[dateField] = {};

    if (fromDate) {
      filter[dateField].$gte = new Date(fromDate);
    }

    if (toDate) {
      filter[dateField].$lte = new Date(toDate);
    }
  }

  return filter;
};

export const campaignQueries = {
  getCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Campaign.getCampaign(_id);
  },

  getCampaigns: async (
    _parent: undefined,
    params: ICampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return await cursorPaginate({
      model: models.Campaign,
      params,
      query: filter,
    });
  },
};
