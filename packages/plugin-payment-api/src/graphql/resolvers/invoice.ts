import { IContext } from '../../connectionResolver';
import { IInvoice } from '../../models/definitions/invoices';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Invoices.findOne({ _id });
  },

  async customer(invoice: IInvoice) {
    return (
      invoice.customerId && { __typename: 'Customer', _id: invoice.customerId }
    );
  },

  async company(invoice: IInvoice) {
    return (
      invoice.companyId && { __typename: 'Company', _id: invoice.companyId }
    );
  },

  async paymentConfig(invoice: IInvoice, {}, { models }: IContext) {
    return (
      invoice.paymentConfigId &&
      models.PaymentConfigs.findOne({ _id: invoice.paymentConfigId })
    );
  }
};
