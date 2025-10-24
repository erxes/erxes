import { IContext } from '~/connectionResolvers';
import { ICouponDocument } from '~/modules/loyalty/@types/coupons';
import { getOwner } from '~/modules/loyalty/db/models/utils';

const TARGET_ACTIONS = {
  pos: { action: 'orders.find', field: 'number' },
  sales: { action: 'deals.find', field: 'name' },
};

export const fetchTarget = async ({
  targetId,
  serviceName,
  subdomain,
}: {
  targetId: string;
  serviceName: string;
  subdomain: string;
}) => {
  const { action, field } = TARGET_ACTIONS[serviceName] || {};

  if (!targetId || !serviceName || !TARGET_ACTIONS[serviceName]) {
    return '';
  }
  // todo
  // const [target] = await sendCommonMessage({
  //   subdomain,
  //   serviceName,
  //   action,
  //   data: {
  //     _id: targetId,
  //   },
  //   isRPC: true,
  //   defaultValue: [],
  // });

  // return target[field];
  return null;
};

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Coupons.findOne({ code: _id }).lean();
  },
  async campaign(coupon: ICouponDocument, _args, { models }: IContext) {
    return models.CouponCampaigns.findOne({ _id: coupon.campaignId }).lean();
  },

  async usageLogs(coupon: any, _args, { subdomain }: IContext) {
    let { usageLogs = [] } = coupon || {};

    return usageLogs.map(async (usageLog) => ({
      owner: await getOwner(subdomain, usageLog.ownerType, usageLog.ownerId),
      ownerType: usageLog.ownerType,
      target: await fetchTarget({
        targetId: usageLog.targetId,
        serviceName: usageLog.targetType,
        subdomain,
      }),
      targetType: usageLog.targetType,
      usedDate: usageLog.usedDate,
    }));
  },
};
