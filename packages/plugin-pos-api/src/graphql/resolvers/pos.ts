import { getConfig } from "../../utils";

const resolvers = {
  integration: (pos, {}, { models }) => {
    if (!pos.integrationId) {
      return null;
    }
    return models.Integrations.findOne({ _id: pos.integrationId });
  },

  user: (pos, {}, { models }) => {
    if (!pos.userId) {
      return null;
    }
    return models.Users.findOne({ _id: pos.userId });
  },

  posName: async (order, {}, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : "";
  },

  userPosOrder: async (order, {}, { models }) => {
    if (!order.userId) {
      return null;
    }
    return models.Users.findOne({ _id: order.userId }).lean();
  },

  customer: async (order, {}, { models }) => {
    if (!order.customerId) {
      return null;
    }
    return models.Customers.findOne({ _id: order.customerId }).lean();
  },

  syncedErkhet: async (order, {}, { subdomain }) => {
    if (order.syncedErkhet) {
      return true;
    }
    const erkhetConfig = await getConfig(subdomain, "ERKHET", {});
    if (!erkhetConfig || !erkhetConfig.apiToken) {
      return true;
    }
    return order.syncedErkhet;
  },

  category: async (posProduct, {}, { models }) => {
    return models.ProductCategories.findOne({
      _id: posProduct.categoryId,
    }).lean();
  },
};

export default resolvers;
