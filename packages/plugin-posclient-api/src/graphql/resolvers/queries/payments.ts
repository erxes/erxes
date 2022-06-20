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
  async fetchRemoteInvoice(_root, models, { orderId }: IInvoiceParams) {
    const order = await models.Orders.getOrder(orderId);
    const invoice = await models.QPayInvoices.findOne({
      senderInvoiceNo: order._id
    });

    if (!invoice) {
      throw new Error(`Invoice not found for order: ${order._id}`);
    }
    return models.QPayInvoices.findOne({ _id: invoice._id });
  },
  async qpayInvoices(_root, models, { page, perPage, number }: IListParams) {
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
