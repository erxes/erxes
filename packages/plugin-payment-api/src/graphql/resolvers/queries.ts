import { requireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../connectionResolver';
import { IPaymentConfigDocument } from '../../models/definitions/payments';
import { getModel } from '../../utils';

interface IParam {
  searchValue?: string;
}

const generateFilter = (params: IParam, commonQuerySelector) => {
  const { searchValue } = params;
  const selector: any = { ...commonQuerySelector };

  if (searchValue) {
    selector.searchValue = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return selector;
};

const paymentConfigQueries = {
  async invoices(
    _root,
    params: IParam & {
      page: number;
      perPage: number;
    },
    { models, commonQuerySelector }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);
    const qpay = await paginate(
      models.QpayInvoices.find(selector).sort({ createdAt: 1 }),
      { ...params }
    );
    const socialPay = await paginate(
      models.SocialPayInvoices.find(selector).sort({ createdAt: 1 }),
      { ...params }
    );
    return [...qpay, ...socialPay];
  },

  async invoicesTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);
    const invoiceCnt = await models.QpayInvoices.find(selector);
    const socialPayCnt = await models.SocialPayInvoices.find(selector);

    return invoiceCnt.length + socialPayCnt.length;
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
    const mainUrl = process.env.PAYMENT_APP_URL || 'http://localhost:3600';
    const route = '/payment_options';
    const base64 = Buffer.from(JSON.stringify(params)).toString('base64');

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

    const model: any = getModel(type, models);

    return model.checkInvoice(data);
  },

  async getInvoice(
    _root,
    { paymentId, invoiceId }: { paymentId: string; invoiceId: string },
    { models }: IContext
  ) {
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentId
    });

    const { type } = paymentConfig || ({} as IPaymentConfigDocument);

    const model: any = getModel(type, models);

    return model.findOne({ _id: invoiceId });
  }
};

// requireLogin(paymentConfigQueries, 'paymentConfigs');
requireLogin(paymentConfigQueries, 'paymentConfigsCountByType');

export default paymentConfigQueries;
