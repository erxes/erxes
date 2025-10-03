import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IPosOrderDocument } from '~/modules/pos/@types/orders';
import { IPosDocument } from '~/modules/pos/@types/pos';

const resolvers = {
  putResponses: async (order) => {
    return sendTRPCMessage({
      pluginName: 'ebarimt',
      module: 'putresponses',
      action: 'find',
      input: {
        query: {
          contentType: 'pos',
          contentId: order._id,
        },
      },
      defaultValue: [],
    });
  },

  posName: async (order, _, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  paidAmounts: async (order: IPosOrderDocument, _, { models }: IContext) => {
    if (!order.paidAmounts || !order.paidAmounts.length) {
      return;
    }

    const pos: IPosDocument | null = await models.Pos.findOne({
      token: order.posToken,
    }).lean();

    if (!pos || !pos.paymentTypes || !pos.paymentTypes.length) {
      return order.paidAmounts;
    }

    const paidAmounts: any[] = order.paidAmounts;
    return paidAmounts.map((paidAmount) => ({
      _id: paidAmount._id,
      type: paidAmount.type,
      amount: paidAmount.amount,
      title: (
        (pos.paymentTypes || []).find((p) => p.type === paidAmount.type) || {
          title: paidAmount.type,
        }
      ).title,
    }));
  },

  user: async (order) => {
    if (!order.userId) {
      return null;
    }
    return await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { _id: order.userId },
    })
  },
};

export default resolvers;
