import { IContext } from '../../connectionResolver';
import { sendCommonMessage, sendContactsMessage } from '../../messageBroker';
import { IInvoice } from '../../models/definitions/invoices';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Invoices.findOne({ _id });
  },

  async customer(invoice: IInvoice, {}, { subdomain }: IContext) {
    switch (invoice.customerType) {
      case 'company':
        return await sendContactsMessage({
          subdomain,
          action: 'companies.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });

      case 'customer':
        return await sendContactsMessage({
          subdomain,
          action: 'customers.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });
      case 'user':
        return await sendCommonMessage('core', {
          subdomain,
          action: 'users.findOne',
          data: { _id: invoice.customerId },
          isRPC: true,
          defaultValue: null
        });

      default:
        return null;
    }
  },

  async payment(invoice: IInvoice, {}, { models }: IContext) {
    return (
      invoice.selectedPaymentId &&
      (await models.Payments.findOne({ _id: invoice.selectedPaymentId }).lean())
    );
  },

  idOfProvider(invoice: IInvoice) {
    const apiResponse: any = invoice.apiResponse || {};

    switch (invoice.paymentKind) {
      case 'qpay':
        return apiResponse.invoice_id;
      case 'socialpay':
        return invoice.identifier;
      case 'qpayQuickqr':
        return apiResponse.id;
      case 'storepay':
        return apiResponse.value;
      case 'monpay':
        return apiResponse.uuid;
      default:
        return 'not supported';
    }
  },

  errorDescription(invoice: IInvoice) {
    const apiResponse: any = invoice.apiResponse || {};

    switch (invoice.paymentKind) {
      case 'qpay':
        return apiResponse.error && apiResponse.error;
      case 'socialpay':
        return apiResponse.error && apiResponse.error;
      case 'qpayQuickqr':
        return apiResponse.error && apiResponse.error;
      case 'storepay':
        return apiResponse.error && apiResponse.error;
      case 'monpay':
        return apiResponse.error && apiResponse.error;
      default:
        return;
    }
  }
};
