import {
  ICouponCampaignDocument,
  ICouponCampaignParams,
} from '@/coupon/@types/couponCampaign';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const couponCampaignQueries = {
  couponCampaigns: async (
    _root: undefined,
    params: ICouponCampaignParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('loyaltyCampaignView');
    const filter: FilterQuery<ICouponCampaignDocument> = {};

    if (params.searchValue) {
      filter.title = new RegExp(escapeRegExp(params.searchValue));
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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('loyaltyCampaignView');
    return models.CouponCampaigns.getCouponCampaign(_id);
  },
};