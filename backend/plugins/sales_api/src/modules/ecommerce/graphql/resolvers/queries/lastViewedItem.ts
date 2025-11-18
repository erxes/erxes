import { IContext } from "~/connectionResolvers";
import { sendTRPCMessage } from "erxes-api-shared/utils";

const lastViewedItemQueries = {
  lastViewedItems: async (_root, params, { subdomain, models }: IContext) => {
    const { customerId } = params;

    const items = await models.LastViewedItem.find({ customerId })
      .sort({ modifiedAt: 1 })
      .limit(params.limit || 10)
      .lean();

    const productIds = items.map(i => i.productId);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
        limit: productIds.length
      },
    });

    const productsById = {};

    for (const product of products) {
      productsById[product._id] = product;
    }

    return items
      .filter(i => Object.keys(productsById).includes(i.productId))
      .map(i => ({ ...i, product: productsById[i.productId] }));
  }
};
export default lastViewedItemQueries;
