import { setPlace } from '../utils/setPlace';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const handlePlace = async (
  subdomain,
  deal,
  productsData,
  placeConfig,
  userId,
  processId,
) => {
  console.log('🔥 handlePlace CALLED');
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    method: 'query',
    input: {
      query: { _id: { $in: productsData.map((p) => p.productId) } },
      limit: productsData.length,
      withTags: true,
    },
    defaultValue: [],
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  const result = await setPlace(
    subdomain,
    deal._id,
    productsData,
    placeConfig,
    productById,
    userId,
    processId,
  );

  return { productsData: result, productById };
};
