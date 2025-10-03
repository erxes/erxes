import { IContext } from '~/connectionResolvers';

const orderMutations = {
  bmsOrderAdd: async (_root, doc, { user, models }: IContext) => {
    const order = await models.Orders.createOrder(doc?.order, user);
    return order;
  },

  bmsOrderEdit: async (_root, { _id, ...doc }, { models }: IContext) => {
    const updated = await models.Orders.updateOrder(_id, doc?.order as any);
    return updated;
  },

  bmsOrderRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models }: IContext,
  ) => {
    await models.Orders.removeOrder(ids);

    return ids;
  },
};

export default orderMutations;
