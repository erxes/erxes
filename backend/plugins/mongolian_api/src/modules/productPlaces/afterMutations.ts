import crypto from 'crypto';
import { isEnabled } from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { handleSplit } from './handlers/handleSplit';
import { handlePlace } from './handlers/handlePlace';
import { handlePricing } from './handlers/handlePricing';
import { handlePrint } from './handlers/handlePrint';
import { getMnConfigs } from './utils/utils';

export default {};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action, user } = params;

  if (type !== 'sales:deal' || action !== 'update') {
    return;
  }

  const deal = params.updatedDocument;
  const oldDeal = params.object;

  if (!deal.stageId || deal.stageId === oldDeal?.stageId) {
    return;
  }

  if (!deal.productsData?.length) {
    return;
  }

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
      user, // user is the user ID string
      crypto.randomUUID(),
    );

    productsData = placeResult.productsData;
    productById = placeResult.productById;

    if ((await isEnabled('pricing')) && placeConfig.checkPricing) {
      productsData = await handlePricing(subdomain, deal, productsData);
    }
  }

  if (printConfig && !productById) {
    const productIds = productsData.map((pd) => pd.productId).filter(Boolean);

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

        productById = Object.fromEntries(products.map((p) => [p._id, p]));
      } catch (error) {}
    } else {
      productById = {};
    }
  }

  if (printConfig && productById) {
    await handlePrint(
      subdomain,
      deal,
      user, // user ID string
      productsData,
      printConfig,
      productById,
    );
  }
};
