import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';

export const lastViewedItemQueries: Record<string, Resolver> = {
  lastViewedItems: async (_root, params, { subdomain, models }: IContext) => {
    const { customerId } = params;

    const items = await models.LastViewedItem.find({ customerId })
      .sort({ modifiedAt: 1 })
      .limit(params.limit || 10)
      .lean();

    const productIds = items.map((i) => i.productId);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
        limit: productIds.length,
      },
    });

    const productsById: Record<string, any> = {};

    for (const product of products || []) {
      productsById[product._id] = product;
    }

    const productIdsSet = new Set(Object.keys(productsById));

    return items
      .filter((i) => productIdsSet.has(i.productId))
      .map((i) => ({ ...i, product: productsById[i.productId] }));
  },

  cpLastViewedItems: async (_root, params, { subdomain, models }: IContext) => {
    const { customerId } = params;

    const items = await models.LastViewedItem.find({ customerId })
      .sort({ modifiedAt: 1 })
      .limit(params.limit || 10)
      .lean();

    const productIds = items.map((i) => i.productId);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
        limit: productIds.length,
      },
    });

    const productsById: Record<string, any> = {};

    for (const product of products || []) {
      productsById[product._id] = product;
    }

    const productIdsSet = new Set(Object.keys(productsById));

    return items
      .filter((i) => productIdsSet.has(i.productId))
      .map((i) => ({ ...i, product: productsById[i.productId] }));
  },
};
export default lastViewedItemQueries;

lastViewedItemQueries.cpLastViewedItems.wrapperConfig = {
  forClientPortal: true,
};
