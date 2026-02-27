import { setPlace } from '../utils/setPlace';
import { sendTRPCMessage } from 'erxes-api-shared/utils';


export const handlePlace = async (
  subdomain,
  deal,
  productsData,
  placeConfig,
) => {
  console.log('🔥 handlePlace RUNNING', {
    dealId: deal._id,
    dealStageId: deal.stageId,
    productsDataCount: productsData.length,
    placeConfigKeys: Object.keys(placeConfig),
  });

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
   console.log('🔥 handlePlace products fetched', {
    productIds: Object.keys(productById),
  });


  const result = await setPlace(subdomain, deal._id, productsData, placeConfig, productById);
  console.log('🔥 handlePlace result productsData', result.map(p => ({
    _id: p._id,
    branchId: p.branchId,
    departmentId: p.departmentId,
  })));

  return { productsData: result, productById };
};
