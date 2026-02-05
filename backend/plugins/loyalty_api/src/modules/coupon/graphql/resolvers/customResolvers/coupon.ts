import { ICouponDocument } from '@/coupon/@types/coupon';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

const TARGET_ACTIONS = {
  pos: { module: 'orders', action: 'find', field: 'number' },
  sales: { module: 'deals', action: 'find', field: 'name' },
};

export const fetchTarget = async ({
  targetId,
  targetType,
  subdomain,
}: {
  targetId: string;
  targetType: string;
  subdomain: string;
}) => {
  const { action, field, module } = TARGET_ACTIONS[targetType] || {};

  if (!targetId || !targetType || !TARGET_ACTIONS[targetType]) {
    return '';
  }

  const [target] = await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    method: 'query',
    module: module,
    action,
    input: {
      query: { _id: targetId },
    },
    defaultValue: [],
  });

  return target[field];
};

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Coupons.findOne({ code: _id }).lean();
  },
  async campaign(
    coupon: ICouponDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.CouponCampaigns.findOne({ _id: coupon.campaignId }).lean();
  },

  async usageLogs(coupon: any, _args: undefined, { subdomain }: IContext) {
    let { usageLogs = [] } = coupon || {};

    return usageLogs.map(async (usageLog) => ({
      owner: await getLoyaltyOwner(subdomain, {
        ownerType: usageLog.ownerType,
        ownerId: usageLog.ownerId,
      }),
      ownerType: usageLog.ownerType,
      target: await fetchTarget({
        targetId: usageLog.targetId,
        targetType: usageLog.targetType,
        subdomain,
      }),
      targetType: usageLog.targetType,
      usedDate: usageLog.usedDate,
    }));
  },
};
