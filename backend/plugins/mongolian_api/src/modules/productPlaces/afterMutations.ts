import crypto from 'crypto';
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
  console.log('🟡 [productPlacesAfterMutation] START');

  const { type, action, user } = params;

  console.log('type:', type);
  console.log('action:', action);

  if (type !== 'sales:deal' || action !== 'update') {
    console.log('❌ skipped: wrong type/action');
    return;
  }

  const deal = params.updatedDocument;
  const oldDeal = params.object;

  console.log('dealId:', deal?._id);
  console.log('stageId:', deal?.stageId);
  console.log('oldStageId:', oldDeal?.stageId);

  if (!deal.stageId) {
    console.log('❌ skipped: no stageId');
    return;
  }

  if (!deal.productsData?.length) {
    console.log('❌ skipped: no productsData');
    return;
  }

  console.log('productsData count:', deal.productsData.length);

  const destinationStageId = deal.stageId;

  const [splitConfig, placeConfig, printConfig] = await getMnConfigs(
    subdomain,
    [
      'dealsProductsDataSplit',
      'dealsProductsDataPlaces',
      'dealsProductsDataPrint',
    ],
    destinationStageId,
  );

  console.log('splitConfig:', splitConfig);
  console.log('placeConfig:', placeConfig);
  console.log('printConfig:', printConfig);

  if (!splitConfig && !placeConfig && !printConfig) {
    console.log('❌ no configs matched');
    return;
  }

  let productsData = deal.productsData;

  console.log(
    'productsData productIds:',
    productsData.map((p) => p.productId),
  );

  if (splitConfig && Object.keys(splitConfig).length > 0) {
    console.log('🔵 running handleSplit');

    productsData = await handleSplit(
      subdomain,
      deal,
      productsData,
      splitConfig,
    );

    console.log('handleSplit result count:', productsData.length);
  }

  let productById: Record<string, any> | undefined;

  if (placeConfig && Object.keys(placeConfig).length > 0) {
    console.log('🟢 running handlePlace');

    const placeResult = await handlePlace(
      subdomain,
      deal,
      productsData,
      placeConfig,
      params.user,
      crypto.randomUUID(),
    );

    console.log('handlePlace result:', placeResult);

    productsData = placeResult.productsData;
    productById = placeResult.productById;

    console.log(
      'productsData after place:',
      JSON.stringify(productsData, null, 2),
    );

    if ((await isEnabled('pricing')) && placeConfig.checkPricing) {
      console.log('🟣 running handlePricing');

      productsData = await handlePricing(subdomain, deal, productsData);

      console.log(
        'productsData after pricing:',
        JSON.stringify(productsData, null, 2),
      );
    }
  }

  if (printConfig && !productById) {
    console.log('🟠 fetching products for print');

    const productIds = productsData.map((pd) => pd.productId).filter(Boolean);

    console.log('productIds:', productIds);

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

        console.log('products fetched:', products);

        productById = Object.fromEntries(products.map((p) => [p._id, p]));
      } catch (error) {
        console.log('❌ product fetch error:', error);
      }
    } else {
      productById = {};
    }
  }

  if (printConfig && productById) {
    console.log('🖨 running handlePrint');

    await handlePrint(
      subdomain,
      deal,
      user,
      productsData,
      printConfig,
      productById,
    );
  }

  console.log('🟢 [productPlacesAfterMutation] END');
};