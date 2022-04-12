import { sendProductsMessage, sendCoreMessage } from '../../messageBroker';
import { getConfig } from "../../utils";

const resolvers = {
  user: (pos, { }, { subdomain }) => {
    if (!pos.userId) {
      return null;
    }

    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: pos.userId },
      isRPC: true
    })
  },

  posName: async (order, { }, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : "";
  },

  userPosOrder: async (order, { }, { models }) => {
    if (!order.userId) {
      return null;
    }
    return models.Users.findOne({ _id: order.userId }).lean();
  },

  customer: async (order, { }, { models }) => {
    if (!order.customerId) {
      return null;
    }
    return models.Customers.findOne({ _id: order.customerId }).lean();
  },

  syncedErkhet: async (order, { }, { subdomain }) => {
    if (order.syncedErkhet) {
      return true;
    }
    const erkhetConfig = await getConfig(subdomain, "ERKHET", {});
    if (!erkhetConfig || !erkhetConfig.apiToken) {
      return true;
    }
    return order.syncedErkhet;
  },

  category: async (posProduct, { }, { subdomain }) => {
    return sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: posProduct.categoryId
      },
      isRPC: true,
    })
  },
};

export default resolvers;
