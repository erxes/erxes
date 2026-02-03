import { ICouponDocument, ICouponParams } from '@/coupon/@types/coupon';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

export const couponQueries = {
  async coupons(_root: undefined, params: ICouponParams, { models }: IContext) {
    const filter: FilterQuery<ICouponDocument> = {};

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
      model: models.Coupons,
      params,
      query: filter,
    });
  },

  async couponsByOwner(
    _root: undefined,
    { ownerId, status }: { ownerId: string; status?: string },
    { models }: IContext,
  ) {
    const filter: FilterQuery<ICouponDocument> = {
      ownerId,
    };

    if (status) {
      filter.status = status;
    }

    const coupons = await models.Coupons.find(filter);

    const couponMap = new Map();

    for (const coupon of coupons) {
      const { campaignId } = coupon;

      const key = campaignId.toString();

      if (couponMap.has(key)) {
        const entry = couponMap.get(key);
        entry.coupons.push(coupon);
        entry.count += 1;
      } else {
        const campaign = await models.CouponCampaigns.findOne({
          _id: campaignId,
        }).lean();

        couponMap.set(key, { campaign, coupons: [coupon], count: 1 });
      }
    }

    return Array.from(couponMap.values());
  },
};
