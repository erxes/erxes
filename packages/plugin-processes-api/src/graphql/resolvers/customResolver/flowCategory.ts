import { FLOW_STATUSES } from "../../../models/definitions/constants";
import { IContext } from "../../../connectionResolver";
import { sendCoreMessage } from "../../../messageBroker";

export default {
  async __resolveReference({ _id }, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: "products.findOne",
      data: { _id },
      isRPC: true
    });
  },

  isRoot(category: any, {}) {
    return category.parentId ? false : true;
  },

  async flowCount(category: any, {}, { models, subdomain }: IContext) {
    const products = await sendCoreMessage({
      subdomain,
      action: "products.find",
      data: {
        query: {},
        categoryId: category._id,
        fields: { _id: 1 },
      },
      isRPC: true,
      defaultValue: []
    });

    const productIds = products.map(p => p._id);

    return await models.Flows.find({
      productId: { $in: productIds },
      status: { $ne: FLOW_STATUSES.ARCHIVED }
    }).countDocuments();
  }
};
