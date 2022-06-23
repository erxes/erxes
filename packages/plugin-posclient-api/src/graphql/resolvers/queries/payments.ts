import { IContext } from '../../types';
import { fetchQPayInvoice, fetchQPayToken } from '../../utils/qpayUtils';
import { escapeRegExp, paginate } from '../../utils/commonUtils';

interface IInvoiceParams {
  orderId: string;
}

interface IListParams {
  page?: number;
  perPage?: number;
  number?: string;
}

const paymentQueries = {
  async fetchRemoteInvoice(
    _root,
    { orderId }: IInvoiceParams,
    { models, config }: IContext
  ) {
    const order = await models.Orders.getOrder(orderId);
    const invoice = await models.QPayInvoices.findOne({
      senderInvoiceNo: order._id
    });

    if (!invoice) {
      throw new Error(`Invoice not found for order: ${order._id}`);
    }

    const tokenInfo = await fetchQPayToken(config.qpayConfig);
    const data = await fetchQPayInvoice(
      invoice.qpayInvoiceId!,
      tokenInfo.access_token,
      config.qpayConfig
    );

    if (!data) {
      throw new Error('Failed to fetch QPay invoice');
    }

    const { invoice_status = '', payments = [] } = data;
    const payment = payments.find(p => p.payment_status === 'PAID');

    if (!invoice.qpayPaymentId && invoice_status === 'CLOSED' && payment) {
      await models.QPayInvoices.updateOne(
        { _id: invoice._id },
        {
          $set: {
            qpayPaymentId: payment.payment_id,
            paymentDate: new Date(),
            status: 'PAID'
          }
        }
      );
    }

    return models.QPayInvoices.findOne({ _id: invoice._id });
  },
  async qpayInvoices(
    _root,
    { page, perPage, number }: IListParams,
    { models }: IContext
  ) {
    const filter: any = {};

    if (number) {
      const orders = await models.Orders.find({
        number: { $regex: new RegExp(escapeRegExp(number), 'i') }
      }).lean();

      if (orders.length > 0) {
        filter.senderInvoiceNo = { $in: orders.map(o => o._id) };
      }
    }

    return paginate(
      models.QPayInvoices.find(filter)
        .sort({ createdAt: -1 })
        .lean(),
      {
        page,
        perPage
      }
    );
  }
};

export default paymentQueries;
