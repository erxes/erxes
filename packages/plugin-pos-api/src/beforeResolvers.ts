import { IModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

export default {
  products: ['productsRemove']
};

export const beforeResolverHandlers = async (
  models: IModels,
  subdomain: string,
  params
) => {
  const { args } = params;
  const productIds = args.productIds;

  const posOrderProductIds = await await models.PosOrders.find({
    'items.productId': productIds
  }).distinct('items.productId');

  if (!posOrderProductIds.length) {
    return args;
  }

  const usedProductsIds: string[] = [];
  const unUsedProductsIds: string[] = [];

  for (const productId of productIds) {
    if (!posOrderProductIds.includes(productId)) {
      unUsedProductsIds.push(productId);
    } else {
      usedProductsIds.push(productId);
    }
  }

  if (usedProductsIds.length > 0) {
    await sendCoreMessage({
      subdomain,
      action: 'products.updateProducts',
      data: {
        selector: { _id: { $in: usedProductsIds } },
        modifier: { $set: { status: 'deleted' } }
      }
    });
  }

  return { ...args, productIds: unUsedProductsIds };
};
