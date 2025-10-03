import { IContext } from '~/connectionResolvers';
import { IInvoice, IInvoiceDocument } from '~/modules/payment/@types/invoices';
// import { sendCommonMessage, sendCoreMessage } from '~/messageBroker';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Invoices.findOne({ _id });
  },

  async transactions(invoice: IInvoiceDocument, _args, { models }: IContext) {
    return models.Transactions.find({ invoiceId: invoice._id });
  },

  async description(invoice: IInvoiceDocument, _args, { models }: IContext) {
    return invoice.description || invoice.invoiceNumber;
  },

  async remainingAmount(
    invoice: IInvoiceDocument,
    _args,
    { models }: IContext,
  ) {
    // find paid transactions with invoiceId
    const transactions = await models.Transactions.find({
      invoiceId: invoice._id,
      status: 'paid',
    });

    // sum of paid transactions

    const paidAmount = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0,
    );

    if (invoice.amount < paidAmount) {
      return invoice.amount - paidAmount;
    } else {
      return 0;
    }
  },

  async customer(invoice: IInvoice) {
    switch (invoice.customerType) {
      case 'company':
        return invoice.customerId
          ? { _id: invoice.customerId, typeName: 'Company' }
          : null;

      case 'customer':
        return invoice.customerId
          ? { _id: invoice.customerId, typeName: 'Customer' }
          : null;
      case 'user':
        return invoice.customerId
          ? { _id: invoice.customerId, typeName: 'User' }
          : null;

      default:
        return null;
    }
  },



  idOfProvider(invoice: IInvoiceDocument) {
    return '';
    // const apiResponse: any = invoice.apiResponse || {};

    // switch (invoice.paymentKind) {
    //   case 'qpay':
    //     return apiResponse.invoice_id;
    //   case 'socialpay':
    //     return invoice._id;
    //   case 'qpayQuickqr':
    //     return apiResponse.id;
    //   case 'storepay':
    //     return apiResponse.value;
    //   case 'monpay':
    //     return apiResponse.uuid;
    //   default:
    //     return 'not supported';
    // }
  },

  errorDescription(invoice: IInvoice) {
    // const apiResponse: any = invoice.apiResponse || {};

    // switch (invoice.paymentKind) {
    //   case 'qpay':
    //     return apiResponse.error && apiResponse.error;
    //   case 'socialpay':
    //     return apiResponse.error && apiResponse.error;
    //   case 'qpayQuickqr':
    //     return apiResponse.error && apiResponse.error;
    //   case 'storepay':
    //     return apiResponse.error && apiResponse.error;
    //   case 'monpay':
    //     return apiResponse.error && apiResponse.error;
    //   default:
    //     return;
    // }

    return '';
  },
};
