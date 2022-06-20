import { IContext } from '../../types';

import { checkInvoiceAmount } from '../../utils/orderUtils';

interface IInvoiceParams {
  orderId: string;
  amount: number;
  _id: string;
}

const INVOICE_STATUSES = {
  PAID: 'PAID',
  OPEN: 'open'
};

const paymentMutations = {
  async createQpaySimpleInvoice(
    _root,
    models,
    params: IInvoiceParams,
    { config }: IContext
  ) {
    if (!config.qpayConfig) {
      throw new Error('QPay config missing');
    }

    try {
      const { orderId, amount } = params;

      const order = await models.Orders.getOrder(orderId);

      await checkInvoiceAmount({ order, amount });

      const invoice = await models.QPayInvoices.createInvoice({
        senderInvoiceNo: order._id,
        amount: amount ? amount.toString() : order.totalAmount.toString()
      });

      return models.QPayInvoices.findOne({ _id: invoice._id });
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async qpayCancelInvoice(
    _root,
    models,
    { _id }: IInvoiceParams,
    { config }: IContext
  ) {
    try {
      const invoice = await models.QPayInvoices.getInvoice(_id);

      if (invoice.status === INVOICE_STATUSES.PAID) {
        throw new Error('Can not cancel paid invoice');
      }

      if (invoice.status === INVOICE_STATUSES.OPEN) {
        return 'success';
      }
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async qpayCheckPayment(
    _root,
    models,
    { _id }: IInvoiceParams,
    { config }: IContext
  ) {
    const invoice = await models.QPayInvoices.getInvoice(_id);

    if (
      invoice.status === INVOICE_STATUSES.PAID &&
      invoice.qpayPaymentId &&
      invoice.paymentDate
    ) {
      throw new Error('QPay payment already made');
    }

    // check payment info

    return models.QPayInvoices.findOne({ _id: invoice._id });
  }
};

export default paymentMutations;
