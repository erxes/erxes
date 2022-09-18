import { IPaymentConfigDocument } from './../../models/definitions/payment';
import { sendQpayMessage, sendSocialPayMessage } from './../../messageBroker';
import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const paymentConfigQueries = {
  paymentConfigs(_root, _args, { models }: IContext) {
    return models.PaymentConfigs.find({ status: 'active' });
  },

  paymentConfigsCountByType(_root, _args, { models }: IContext) {
    return models.PaymentConfigs.find({
      status: 'active'
    }).countDocuments();
  },

  // {
  //   paymentIds,
  //   amount,
  //   customerId,
  //   companyId,
  //   contentType,
  //   contentTypeId
  // }: {
  //   paymentIds: string[];
  //   amount: number;
  //   customerId: string;
  //   companyId: string;
  //   contentType: string;
  //   contentTypeId: string;
  // }

  getPaymentOptions(_root, params, { models }: IContext) {
    console.log('Process: ', JSON.stringify(process.env));
    const mainUrl = process.env.PAYMENT_APP_URL || 'http://localhost:3202/';
    const route = 'payment_options';
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
