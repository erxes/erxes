import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICouponCampaignParams } from '~/modules/coupon/@types/campaign';

export const couponCampaignQueries = {
  getCouponCampaigns: async (
    _root,
    params: ICouponCampaignParams,
    { models }: IContext,
  ) => {
    const {
      searchValue,
      status,
      fromDate,
      toDate,
      dateField = 'createdAt',
    } = params;

    const filter: any = {};

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

    return cursorPaginate({
      model: models.CouponCampaign,
      params,
      query: filter,
    });
  },

  getCouponCampaign: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CouponCampaign.getCampaign(_id);
  },
};
