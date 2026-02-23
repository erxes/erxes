import { splitData } from '../utils/splitData';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const handleSplit = async (
  subdomain,
  deal,
  productsData,
  splitConfig,
) => {
  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'products',
    action: 'find',
    method: 'query',
    input: {
      query: { _id: { $in: productsData.map((p) => p.productId) } },
      limit: productsData.length,
    },
    defaultValue: [],
  });

  const productById = {};
  for (const product of products) {
    productById[product._id] = product;
  }

  return splitData(subdomain, deal._id, productsData, splitConfig, productById);
};
