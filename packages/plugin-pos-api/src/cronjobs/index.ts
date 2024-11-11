import { generateModels } from '../connectionResolver';
import { SUBSCRIPTION_INFO_STATUS } from '../contants';
import { debugError } from '../debugger';
import { sendPosclientMessage, sendCoreMessage } from '../messageBroker';
import * as moment from 'moment';
import { nanoid } from 'nanoid';

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

    const START_TODAY = new Date(TODAY.setHours(0, 0, 0, 0));
    const END_TODAY = new Date(TODAY.setHours(23, 59, 59, 59));

    const subscriptions = await models.PosOrders.find({
      $and: [
        { 'items.closeDate': { $gte: START_TODAY } },
        { 'items.closeDate': { $lte: END_TODAY } }
      ],
      customerId: { $exists: true, $nin: [null, ''] },
      'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.ACTIVE,
      status: 'complete'
    }).lean();

    for (const subscription of subscriptions) {
      const {
        items = [],
        posToken,
        origin,
        type,
        customerType,
        customerId,
        description,
        subscriptionInfo
      } = subscription;

      const pos = await models.Pos.findOne({ token: posToken }).lean();
      if (!pos) {
        continue;
      }

      const doc = {
        origin,
        type,
        customerType,
        customerId,
        description,
        status: 'new',
        createdAt: new Date(),
        subscriptionId: subscriptionInfo?.subscriptionId,
        posToken
      };

      for (const item of items) {
        if (
          pos &&
          item.closeDate &&
          item.closeDate > START_TODAY &&
          item.closeDate < END_TODAY
        ) {
          const product = await sendCoreMessage({
            subdomain,
            action: 'products.findOne',
            data: {
              _id: item.productId
            },
            isRPC: true,
            defaultValue: null
          });

          const uom = await sendCoreMessage({
            subdomain,
            action: 'uoms.findOne',
            data: { code: product?.uom },
            isRPC: true,
            defaultValue: null
          });

          const { subscriptionConfig = {} } = uom || {};

          const { period, rule, specificDay, subsRenewable } =
            subscriptionConfig;

          if (
            ['fromExpiredDate', 'fromSpecificDate'].includes(rule) &&
            !subsRenewable
          ) {
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
            item.closeDate = nextCloseDate;
          }

          await sendPosclientMessage({
            subdomain,
            action: 'createOrder',
            data: {
              order: {
                ...doc,
                _id: nanoid(),
                items: [{ ...item, status: 'new' }]
              }
            },
            pos
          }).catch(error => {
            debugError(error.message);
          });
        }
      }

      await sendPosclientMessage({
        subdomain,
        action: 'erxes-posclient-to-pos-api',
        data: {
          order: {
            _id: subscription._id,
            'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.CLOSED
          }
        },
        pos
      });

      await models.PosOrders.updateOne(
        { _id: subscription._id },
        { 'subscriptionInfo.status': SUBSCRIPTION_INFO_STATUS.CLOSED }
      );
    }
  }
};
