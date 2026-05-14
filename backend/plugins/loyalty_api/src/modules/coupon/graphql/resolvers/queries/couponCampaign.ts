import {
  ICouponCampaignDocument,
  ICouponCampaignParams,
} from '@/coupon/@types/couponCampaign';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const couponCampaignQueries = {
  couponCampaigns: async (
    _root: undefined,
    params: ICouponCampaignParams,
    { models }: IContext,
  ) => {
    const filter: FilterQuery<ICouponCampaignDocument> = {};

    if (params.searchValue) {
      filter.title = new RegExp(params.searchValue);
    }

    if (params.status) {
      filter.status = params.status;
    }

    return cursorPaginate({
      model: models.CouponCampaigns,
      params,
      query: filter,
    });
  },

  couponCampaign: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CouponCampaigns.getCouponCampaign(_id);
  },
};
