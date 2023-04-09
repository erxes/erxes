import { sendProductsMessage } from './messageBroker';
import { setPlace } from './utils/setPlace';
import { splitData } from './utils/splitData';
import { getConfig } from './utils/utils';

export default {
  'cards:deal': ['update']
};

export const afterMutationHandlers = async (subdomain, params) => {
  const { type, action } = params;

  if (type === 'cards:deal') {
    if (action === 'update') {
      const deal = params.updatedDocument;
      const oldDeal = params.object;
      const destinationStageId = deal.stageId || '';

      if (!(destinationStageId && destinationStageId !== oldDeal.stageId)) {
        return;
      }

      if (!(deal.productsData && deal.productsData.length)) {
        return;
      }

      const splitConfigs = await getConfig(
        subdomain,
        'dealsProductsDataSplit',
        {}
      );
      const placeConfigs = await getConfig(
        subdomain,
        'dealsProductsDataPlaces',
        {}
      );

      if (
        !(
          Object.keys(splitConfigs).includes(destinationStageId) ||
          Object.keys(placeConfigs).includes(destinationStageId)
        )
      ) {
        return;
      }

      const pdatas = deal.productsData;
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { _id: { $in: pdatas.map(pd => pd.productId) } },
          limit: pdatas.length
        },
        isRPC: true,
        defaultValue: []
      });
      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      let pDatas = deal.productsData;

      if (Object.keys(splitConfigs).includes(destinationStageId)) {
        pDatas = await splitData(
          subdomain,
          deal._id,
          pDatas,
          splitConfigs[destinationStageId],
          productById
        );
      }

      if (Object.keys(placeConfigs).includes(destinationStageId)) {
        await setPlace(
          subdomain,
          deal._id,
          pDatas,
          placeConfigs[destinationStageId],
          productById
        );
      }
    }
    return;
  }
};
