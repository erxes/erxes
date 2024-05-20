import { generateModels } from '../connectionResolver';
import { ordersAdd } from '../graphql/resolvers/mutations/orders';
import { IOrderInput, IOrderItemInput } from '../graphql/types';
import { sendProductsMessage } from '../messageBroker';
import {
  ORDER_STATUSES,
  SUBSCRIPTION_INFO_STATUS,
} from '../models/definitions/constants';
import moment from 'moment';

function toSpecificDayOfWeek(date, dayOfWeek) {
  let currentDay = date.getDay();
  let daysToAdd = (dayOfWeek - currentDay + 7) % 7;
  date.setDate(date.getDate() + daysToAdd);
  return date;
}

export default {
  handleDailyJob: async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    const TODAY = new Date();

    const subscriptions = await models.Orders.find({
      $and: [
        { closeDate: { $gte: TODAY.setHours(0, 0, 0, 0) } },
        { closeDate: { $lte: TODAY.setHours(23, 59, 59, 59) } },
      ],
      'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.ACTIVE,
      status: ORDER_STATUSES.COMPLETE,
    });

    for (const subscription of subscriptions) {
      const { items } = subscription;

      let doc: IOrderInput = {
        items: subscription.items as IOrderItemInput[],
        totalAmount: subscription.totalAmount,
        directDiscount: subscription.directDiscount,
        type: subscription?.type || '',
        customerId: subscription.customerId,
        customerType: subscription.customerType,
        branchId: subscription.branchId,
        deliveryInfo: subscription.deliveryInfo,
        origin: subscription.origin,
        slotCode: subscription.slotCode,
        dueDate: subscription.dueDate,
        description: subscription?.description || '',
        isPre: subscription.isPre,
        isSubscription: true,
        subscriptionId: subscription.subscriptionInfo?.subscriptionId,
      };

      const posProduct = await models.Products.findOne({
        _id: items[0].productId,
      });

      const posProductUom = await sendProductsMessage({
        subdomain,
        action: 'uoms.findOne',
        data: {
          code: posProduct?.uom,
        },
        isRPC: true,
        defaultValue: {},
      });

      const { subscriptionConfig = {} } = posProductUom;

      const { period, rule, specificDay } = subscriptionConfig;

      if (['fromExpiredDate', 'fromSpecificDate'].includes(rule)) {
        let nextCloseDate = new Date(
          moment().add(1, period.replace('ly', '')).toISOString()
        );

        if (rule === 'fromSpecificDate') {
          if (period === 'monthly') {
            nextCloseDate = new Date(nextCloseDate.setDate(specificDay));
          }
          if (period === 'weekly') {
            nextCloseDate = toSpecificDayOfWeek(nextCloseDate, 3);
          }
        }
        doc.closeDate = nextCloseDate;
      }

      const user = await models.PosUsers.findOne({ _id: subscription.userId });
      const pos = await models.Configs.findOne({
        token: subscription.posToken,
      });

      await ordersAdd(doc, {
        models,
        subdomain,
        posUser: user as any,
        config: pos as any,
      });

      await models.Orders.updateOne(
        { _id: subscription._id },
        { 'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.DONE }
      );
    }
  },
};
