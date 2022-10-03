import { requireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../connectionResolver';
import { IPaymentConfigDocument } from '../../models/definitions/paymentConfigs';

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
    // const qpay = await paginate(
    //   models.QpayInvoices.find(selector).sort({ createdAt: 1 }),
    //   { ...params }
    // );
    // const socialPay = await paginate(
    //   models.SocialPayInvoices.find(selector).sort({ createdAt: 1 }),
    //   { ...params }
    // );
    return [];
  },

  async invoicesTotalCount(
    _root,
    params: IParam,
    { commonQuerySelector, models }: IContext
  ) {
    const selector = generateFilter(params, commonQuerySelector);
    // const invoiceCnt = await models.QpayInvoices.find(selector);
    // const socialPayCnt = await models.SocialPayInvoices.find(selector);

    return 0;
  },

  paymentConfigs(_root, args, { models }: IContext) {
    const paymentConfigIds: string[] = args.paymentConfigIds;

    const filter: any = { status: 'active' };
    if (paymentConfigIds && paymentConfigIds.length) {
      filter._id = { $in: paymentConfigIds };
    }

    return models.PaymentConfigs.find(filter).sort({ type: 1 });
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
    {
      paymentConfigId,
      invoiceId
    }: { paymentConfigId: string; invoiceId: string },
    { models }: IContext
  ) {
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentConfigId
    });

    const { config, type } = paymentConfig || ({} as IPaymentConfigDocument);

    const data = {
      config,
      paymentConfigId,
      invoiceId
    };

    // const model: any = getModel(type, models);

    // return model.checkInvoice(data);
    return null;
  },

  async getInvoice(
    _root,
    {
      paymentConfigId,
      invoiceId
    }: { paymentConfigId: string; invoiceId: string },
    { models }: IContext
  ) {
    const paymentConfig = await models.PaymentConfigs.findOne({
      _id: paymentConfigId
    });

    const { type } = paymentConfig || ({} as IPaymentConfigDocument);

    // const model: any = getModel(type, models);

    // return model.findOne({ _id: invoiceId });
    return null;
  }
};

// requireLogin(paymentConfigQueries, 'paymentConfigs');
requireLogin(paymentConfigQueries, 'paymentConfigsCountByType');

export default paymentConfigQueries;
