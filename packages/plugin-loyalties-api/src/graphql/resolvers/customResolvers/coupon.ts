import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { ICouponDocument } from '../../../models/definitions/coupons';
import { getOwner } from '../../../models/utils';

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

  const [target] = await sendCommonMessage({
    subdomain,
    serviceName,
    action,
    data: {
      _id: targetId,
    },
    isRPC: true,
    defaultValue: [],
  });

  return target[field];
};

export default {
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
