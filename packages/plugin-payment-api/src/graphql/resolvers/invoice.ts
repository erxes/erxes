import { IContext } from '../../connectionResolver';
import { sendContactsMessage } from '../../messageBroker';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.QpayInvoices.findOne({ _id });
  },

  async type(invoice: any, {}, { models }: IContext) {
    const checkQpay = await models.QpayInvoices.findOne({ _id: invoice._id });

    return checkQpay ? 'qpay' : 'socialPay';
  },

  async comment(invoice: any, {}, { models }: IContext) {
    const checkSpay = await models.SocialPayInvoices.findOne({
      _id: invoice._id
    });

    return checkSpay
      ? checkSpay.phone
        ? `${checkSpay.phone} mobile invoice`
        : 'socialPay invoice'
      : 'qpay invoice';
  },

  async paymentId(invoice: any, {}, { models }: IContext) {
    const checkQpay = await models.QpayInvoices.findOne({
      _id: invoice._id
    });

    return checkQpay ? checkQpay.qpayPaymentId : '';
  },

  async customerId(invoice: any, {}, { subdomain }: IContext) {
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: invoice.customerId },
      isRPC: true
    });

    return customer;
  },

  async companyId(invoice: any, {}, { subdomain }: IContext) {
    const company = await sendContactsMessage({
      subdomain,
      action: 'companies.findOne',
      data: { _id: invoice.customerId },
      isRPC: true
    });

    return company;
  }
};
