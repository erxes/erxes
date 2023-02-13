import { IOrderDocument } from '../../models/definitions/orders';
import { sendContactsMessage } from '../../messageBroker';
import { IContext } from '../../connectionResolver';

export default {
  async items(order: IOrderDocument, {}, { models }: IContext) {
    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.customerId) {
      return null;
    }

    return sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: order.customerId },
      isRPC: true
    });
  },

  user(order: IOrderDocument, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },
  putResponses(order: IOrderDocument, {}, { models }: IContext) {
    return models.PutResponses.find({
      contentType: 'pos',
      contentId: order._id
    })
      .sort({ createdAt: -1 })
      .lean();
  }
};
