import { IOrderInput } from '@erxes/api-utils/src/commonUtils';
import { generateModels } from '../connectionResolver';
import { SUBSCRIPTION_INFO_STATUS } from '../contants';

export default {
  handleDailyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    const TODAY = new Date();

    const START_TODAY = new Date(TODAY.setHours(0, 0, 0, 0));
    const END_TODAY = new Date(TODAY.setHours(23, 59, 59, 59));

    const subscriptions = await models.PosOrders.find({
      $and: [
        { 'items.closeDate': { $gte: START_TODAY } },
        { 'items.closeDate': { $lte: END_TODAY } },
      ],
      'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.ACTIVE,
      status: 'complete',
    });

    for (const subscription of subscriptions) {
      const { items = [] } = subscription;

      for (const item of items) {
        if (
          item.closeDate &&
          item.closeDate > START_TODAY &&
          item.closeDate < END_TODAY
        ) {
          //   let doc: IOrderInput = {
          //       items: subscription.items ,
          //             totalAmount: subscription.totalAmount,
          //             directDiscount: subscription.directDiscount,
          //             type: subscription?.type || '',
          //             customerId: subscription.customerId,
          //             customerType: subscription.customerType,
          //             branchId: subscription.branchId,
          //             deliveryInfo: subscription.deliveryInfo,
          //             origin: subscription.origin,
          //             slotCode: subscription.slotCode,
          //             dueDate: subscription.dueDate,
          //             description: subscription?.description || '',
          //             isPre: subscription.isPre,
          //             isSubscription: true,
          //             subscriptionId: subscription.subscriptionInfo?.subscriptionId,
          //         };
          //     }
        }
      }
    }
  },
};
