import {
  checkPermission,
  requireLogin
} from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";

const orderMutations = {
  bmOrderAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const order = await models.Orders.createOrder(
      docModifier(doc?.order),
      user
    );
    return order;
  },

  bmOrderEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.Orders.updateOrder(_id, doc?.order as any);
    return updated;
  },

  bmOrderRemove: async (
    _root,
    { ids }: { ids: string[] },
    { models, user }: IContext
  ) => {
    await models.Orders.removeOrder(ids);

    return ids;
  }
};

export default orderMutations;
