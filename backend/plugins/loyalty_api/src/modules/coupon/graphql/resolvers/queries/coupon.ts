import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICouponParams } from '~/modules/coupon/@types/coupon';

export const couponQueries = {
  getCoupons: async (
    _root: undefined,
    params: ICouponParams,
    { models }: IContext,
  ) => {
    const filter: any = {};

    if (params.status) {
      filter.status = params.status;
    }

    if (params.ownerType) {
      filter.ownerType = params.ownerType;
    }

    if (params.ownerId) {
      filter.ownerId = params.ownerId;
    }

    if (params.campaignId) {
      filter.campaignId = params.campaignId;
    }

    if (params.fromDate) {
      filter.createdAt = { $gte: new Date(params.fromDate) };
    }

    if (params.toDate) {
      filter.createdAt = {
        ...(filter.createdAt || {}),
        $lt: new Date(params.toDate),
      };
    }

    return await cursorPaginate({
      model: models.Coupon,
      params,
      query: filter,
    });
  },

  getOwnerCoupons: async (
    _root: undefined,
    { ownerId, status }: { ownerId: string; status?: string },
    { models }: IContext,
  ) => {
    const filter: any = {
      ownerId,
    };

    if (status) {
      filter.status = status;
    }

    const coupons = await models.Coupon.find(filter);

    const couponMap = new Map();

    for (const coupon of coupons) {
      const { campaignId } = coupon;

      const key = campaignId.toString();

      if (couponMap.has(key)) {
        const entry = couponMap.get(key);
        entry.coupons.push(coupon);
        entry.count += 1;
      } else {
        const campaign = await models.Campaign.findOne({
          _id: campaignId,
        }).lean();

        couponMap.set(key, { campaign, coupons: [coupon], count: 1 });
      }
    }

    return Array.from(couponMap.values());
  },
};
