import { IContext } from './../../../../plugin-ads-api/src/connectionResolver';
import { IOrderDocument } from '../../models/definitions/orders';
import { OrderItems } from '../../models/OrderItems';
import { PutResponses } from '../../models/PutResponses';
import { QPayInvoices } from '../../models/QPayInvoices';
import PosUsers from '../../models/PosUsers';
import { sendContactsMessage } from '../../messageBroker';

export default {
  async items(order: IOrderDocument) {
    return await OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
    return sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: order.customerId },
      isRPC: true
    });
  },

  user(order: IOrderDocument) {
    return PosUsers.findOne({ _id: order.userId });
  },
  putResponses(order: IOrderDocument) {
    return PutResponses.find({ contentType: 'pos', contentId: order._id })
      .sort({ createdAt: -1 })
      .lean();
  },
  qpayInvoice(order: IOrderDocument) {
    return QPayInvoices.findOne({ senderInvoiceNo: order._id }).lean();
  },
  qpayInvoices(order: IOrderDocument) {
    return QPayInvoices.find({ senderInvoiceNo: order._id })
      .sort({ createdAt: -1 })
      .lean();
  }
};
