import { isEnabled } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { handleSplit } from './handlers/handleSplit';
import { handlePlace } from './handlers/handlePlace';
import { handlePricing } from './handlers/handlePricing';
import { handlePrint } from './handlers/handlePrint';
import { getMnConfigs } from './utils/utils';

export default {
  'sales:deal': ['update'],
};

export const afterMutationHandlers = async (subdomain, params) => {
  console.log(
    '🔥 afterMutationHandlers RUNNING',
    JSON.stringify(params, null, 2),
  );
  const { type, action, user } = params;

  if (type !== 'sales:deal' || action !== 'update') {
    console.log('🔥 afterMutationHandlers: type/action mismatch, returning');
    return;
  }

  const deal = params.updatedDocument;
  const oldDeal = params.object;

  if (!deal.stageId) {
    console.log('🔥 afterMutationHandlers: deal has no stageId, returning');
    return;
  }

  if (!deal.productsData?.length) {
    console.log('🔥 afterMutationHandlers: no productsData, returning');
    return;
  }

  const destinationStageId = deal.stageId;
  console.log(
    '🔥 afterMutationHandlers destinationStageId',
    destinationStageId,
  );

  const [splitConfig, placeConfig, printConfig] = await getMnConfigs(
    subdomain,
    [
      'dealsProductsDataSplit',
      'dealsProductsDataPlaces',
      'dealsProductsDataPrint',
    ],
    destinationStageId,
  );

  console.log('🔥 afterMutationHandlers configs', {
    splitConfig: splitConfig ? 'found' : 'not found',
    placeConfig: placeConfig ? 'found' : 'not found',
    printConfig: printConfig ? 'found' : 'not found',
  });

  if (!splitConfig && !placeConfig && !printConfig) {
    return;
  }

  let productsData = deal.productsData;

  if (splitConfig && Object.keys(splitConfig).length > 0) {
    productsData = await handleSplit(
      subdomain,
      deal,
      productsData,
      splitConfig,
    );
  }

  let productById: Record<string, any> | undefined;

  if (placeConfig && Object.keys(placeConfig).length > 0) {
    const placeResult = await handlePlace(
      subdomain,
      deal,
      productsData,
      placeConfig,
    );
    productsData = placeResult.productsData;
    productById = placeResult.productById;

    if ((await isEnabled('pricing')) && placeConfig.checkPricing) {
      productsData = await handlePricing(subdomain, deal, productsData);
    }
  }

  // Log print config details
  console.log(
    '🔥 printConfig conditions length:',
    printConfig?.conditions?.length,
  );
  console.log('🔥 conditions:', JSON.stringify(printConfig?.conditions));

  // If print config exists and we still don't have productById, fetch products now
  // ... after split/place handling ...

  // Log print config details (optional)
  console.log('🔥 printConfig exists:', !!printConfig);

  // If print config exists and we still don't have productById, fetch products now
  if (printConfig && !productById) {
    console.log('🔥 Fetching products for print');
    const productIds = productsData.map((pd) => pd.productId).filter(Boolean);
    console.log('🔥 productIds:', productIds);
    if (productIds.length) {
      try {
        const products = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'products',
          action: 'find',
          method: 'query',
          input: { _id: { $in: productIds } },
        });
        console.log('🔥 products fetched count:', products.length);
        productById = Object.fromEntries(products.map((p) => [p._id, p]));
      } catch (error) {
        console.error('🔥 Error fetching products:', error);
      }
    } else {
      productById = {}; // still truthy, but no product details
    }
  }

  // Now handle printing if we have a print config and product data
  if (printConfig && productById) {
    console.log('🔥 Calling handlePrint');
    await handlePrint(
      subdomain,
      deal,
      user,
      productsData,
      printConfig,
      productById,
    );
  } else {
    console.log('🔥 handlePrint skipped: printConfig or productById missing');
  }
};
