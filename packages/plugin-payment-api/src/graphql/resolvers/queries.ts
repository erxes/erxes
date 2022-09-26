import { requireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../connectionResolver';
import { IPaymentConfigDocument } from './../../models/definitions/payment';

const paymentConfigQueries = {
  async invoices(_root, args, { models }: IContext) {
    const filter = {};

    const qpay = await paginate(
      models.QpayInvoices.find(filter).sort({ createdAt: 1 }),
      args
    );
    const socialPay = await paginate(
      models.SocialPayInvoices.find(filter).sort({ createdAt: 1 }),
      args
    );
    return [...qpay, ...socialPay];
  },

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

  getPaymentOptions(_root, params, _args) {
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
    { models }: IContext
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

    const response =
      type.toLowerCase() === 'qpay'
        ? await models.QpayInvoices.checkInvoice(data)
        : await models.SocialPayInvoices.checkInvoice(data);

    return response;
  }
};

// requireLogin(paymentConfigQueries, 'paymentConfigs');
requireLogin(paymentConfigQueries, 'paymentConfigsCountByType');

export default paymentConfigQueries;
