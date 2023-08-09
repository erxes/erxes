import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

const lastViewedItemQueries = {
  lastViewedItems: async (_root, params, { subdomain, models }: IContext) => {
    const { customerId } = params;

    const items = await models.LastViewedItem.find({ customerId })
      .sort({ modifiedAt: 1 })
      .limit(params.limit || 10)
      .lean();

    const productIds = items.map(i => i.productId);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: productIds } },
        limit: productIds.length
      },
      isRPC: true
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
