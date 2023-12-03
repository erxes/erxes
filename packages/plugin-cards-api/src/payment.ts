import { monitorEventLoopDelay } from 'perf_hooks';
import { generateModels } from './connectionResolver';
import * as moment from 'moment';

export default {
  callback: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const paymentParams = data;

    if (
      paymentParams.contentType !== 'cards:deal' ||
      paymentParams.status !== 'paid'
    ) {
      return;
    }
    console.log(paymentParams, 'paymentParams');
    const orderSelector = {
      _id: paymentParams.contentTypeId
    };

    for (const key in paymentParams) {
      if (paymentParams.hasOwnProperty(key)) {
        const { contentTypeId, amount, _id } = paymentParams;
        if (orderSelector._id !== contentTypeId) {
          continue;
        }

        console.log(paymentParams, 'paymentParams');
        await models.Deals.updateOne(orderSelector, {
          $addToSet: {
            mobileAmounts: {
              _id,
              amount
            }
          }
        });
      }
    }
    const order = await models.Deals.findOne(orderSelector).lean();
    const sumMobileAmount = (order.mobileAmounts || []).reduce(
      (sum, i) => sum + i.amount,
      0
    );
    await models.Deals.updateOne(orderSelector, {
      $set: { mobileAmount: sumMobileAmount }
    });
    console.log(sumMobileAmount, 'sumMobileAmount');
    return sumMobileAmount;
  }
};
