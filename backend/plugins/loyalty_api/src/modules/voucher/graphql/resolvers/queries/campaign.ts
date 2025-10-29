import {
  IVoucherCampaign,
  IVoucherCampaignParams,
} from '@/voucher/@types/campaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IVoucherCampaignParams) => {
  const filter: FilterQuery<IVoucherCampaign> = {};

  const {
    searchValue,
    status,
    fromDate,
    toDate,
    dateField = 'createdAt',
  } = params || {};

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

export const voucherCampaignQueries = {
  getVoucherCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.VoucherCampaign.getCampaign(_id);
  },

  getVoucherCampaigns: async (
    _parent: undefined,
    params: IVoucherCampaignParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return await cursorPaginate({
      model: models.VoucherCampaign,
      params,
      query: filter,
    });
  },
};
