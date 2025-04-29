import { checkPermission, paginate } from '@erxes/api-utils/src';
import { SortOrder } from 'mongoose';
import { IContext } from '../../../connectionResolver';
import { ICommonParams } from '../../../models/definitions/common';

const couponQueries = {
  coupons: async (
    _root,
    params: ICommonParams & { fromDate: string; toDate: string },
    { models }: IContext,
  ) => {
    const { sortField = 'createdAt', sortDirection = -1 } = params;

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

    return {
      list: await paginate(
        models.Coupons.find(filter).sort({
          [sortField]: sortDirection as SortOrder,
        }),
        params,
      ),
      totalCount: await models.Coupons.countDocuments(filter),
    };
  },

  async couponsByOwner(
    _root,
    { ownerId, status }: { ownerId: string; status?: string },
    { models }: IContext,
  ) {
    const filter: any = {
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

checkPermission(couponQueries, 'coupons', 'showLoyalties');

export default couponQueries;
