import {
  sendCoreMessage,
  sendContactsMessage,
  sendEbarimtMessage
} from '../../messageBroker';
import { getConfig } from '../../utils';

const resolvers = {
  user: (order, {}, { subdomain }) => {
    if (!order.userId) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: order.userId },
      isRPC: true
    });
  },

  posName: async (order, {}, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  customer: async (order, {}, { subdomain }) => {
    if (!order.customerId) {
      return null;
    }
    return await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: order.customerId
      },
      isRPC: true
    });
  },

  syncedErkhet: async (order, {}, { subdomain }) => {
    if (order.syncedErkhet) {
      return true;
    }
    const erkhetConfig = await getConfig(subdomain, 'ERKHET', {});
    if (!erkhetConfig || !erkhetConfig.apiToken) {
      return true;
    }
    return order.syncedErkhet;
  },

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
  }
};

export default resolvers;
