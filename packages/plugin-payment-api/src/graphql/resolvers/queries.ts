import { requireLogin } from '@erxes/api-utils/src/permissions';

import { IContext } from '../../connectionResolver';
import { sendQpayMessage, sendSocialPayMessage } from './../../messageBroker';
import { IPaymentConfigDocument } from './../../models/definitions/payment';

const paymentConfigQueries = {
  paymentConfigs(_root, args, { models }: IContext) {
    const paymentIds: string[] = args.paymentIds;

    const filter: any = { status: 'active' };
    if (paymentIds && paymentIds.length) {
      filter._id = { $in: paymentIds };
    }

    return models.PaymentConfigs.find(filter);
  },

  paymentConfigsCountByType(_root, _args, { models }: IContext) {
    return models.PaymentConfigs.find({
      status: 'active'
    }).countDocuments();
  },

  getPaymentOptions(_root, params, { models }: IContext) {
    console.log('Process: ', JSON.stringify(process.env));
    const mainUrl = process.env.PAYMENT_APP_URL || 'http://localhost:3600';
    const route = '/payment_options';
    const base64 = Buffer.from(JSON.stringify(params)).toString('base64');
    console.log(Buffer.from(base64, 'base64').toString('ascii'));
    return mainUrl + route + '?q=' + base64;
  },

  async checkInvoice(
    _root,
    { paymentId, invoiceId }: { paymentId: string; invoiceId: string },
    { subdomain, models }: IContext
  ) {
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentId
    });

    const { config, type } = paymentConfig || ({} as IPaymentConfigDocument);

    const data = {
      config,
      paymentId,
      invoiceId
    };

    const messageBrokerResponse =
      type.toLowerCase() === 'qpay'
        ? await sendQpayMessage({
            subdomain,
            action: 'checkInvoice',
            data,
            isRPC: true
          })
        : await sendSocialPayMessage({
            subdomain,
            action: 'checkInvoice',
            data,
            isRPC: true
          });

    return messageBrokerResponse;
  }
};

// requireLogin(paymentConfigQueries, 'paymentConfigs');
requireLogin(paymentConfigQueries, 'paymentConfigsCountByType');

export default paymentConfigQueries;
