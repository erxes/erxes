import { IContext } from '../../connectionResolver';
import { sendCoreMessage, sendEbarimtMessage } from '../../messageBroker';
import { IPosDocument } from '../../models/definitions/pos';
import { IPosOrderDocument } from '../../models/definitions/orders';

const resolvers = {
  putResponses: async (order, {}, { subdomain }) => {
    return sendEbarimtMessage({
      subdomain,
      action: 'putresponses.find',
      data: {
        query: {
          contentType: 'pos',
          contentId: order._id
        }
      },
      isRPC: true
    });
  },

  posName: async (order, {}, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  paidAmounts: async (order: IPosOrderDocument, {}, { models }: IContext) => {
    if (!order.paidAmounts || !order.paidAmounts.length) {
      return;
    }

    const pos: IPosDocument | null = await models.Pos.findOne({
      token: order.posToken
    }).lean();

    if (!pos || !pos.paymentTypes || !pos.paymentTypes.length) {
      return order.paidAmounts;
    }

    const paidAmounts: any[] = order.paidAmounts;
    return paidAmounts.map(paidAmount => ({
      _id: paidAmount._id,
      type: paidAmount.type,
      amount: paidAmount.amount,
      title: (
        (pos.paymentTypes || []).find(p => p.type === paidAmount.type) || {
          title: paidAmount.type
        }
      ).title
    }));
  },

  user: async (order, {}, { subdomain }) => {
    if (!order.userId) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: order.userId },
      isRPC: true
    });
  }
};

export default resolvers;
