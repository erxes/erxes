import { sendCoreMessage, sendEbarimtMessage } from '../../messageBroker';

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
