import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import {
  sendCardsMessage,
  sendPricingMessage,
  sendProductsMessage
} from './messageBroker';
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

      let pDatas = deal.productsData;
      const products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { _id: { $in: pDatas.map(pd => pd.productId) } },
          limit: pDatas.length
        },
        isRPC: true,
        defaultValue: []
      });
      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

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
        const placeConfig = placeConfigs[destinationStageId];
        pDatas = await setPlace(
          subdomain,
          deal._id,
          pDatas,
          placeConfig,
          productById
        );

        if ((await isEnabled('pricing')) && placeConfig.checkPricing) {
          const groupedData: any = {};
          for (const data of pDatas) {
            const { branchId = '', departmentId = '' } = data;

            if (!Object.keys(groupedData).includes(branchId)) {
              groupedData[branchId] = {};
            }

            if (!Object.keys(groupedData[branchId]).includes(departmentId)) {
              groupedData[branchId][departmentId] = [];
            }

            groupedData[branchId][departmentId].push(data);
          }

          let isSetPricing = false;
          let afterPricingData = [];

          for (const branchId of Object.keys(groupedData)) {
            for (const departmentId of Object.keys(groupedData[branchId])) {
              const perDatas = groupedData[branchId][departmentId];

              if (perDatas.length) {
                const pricing = await sendPricingMessage({
                  subdomain,
                  action: 'checkPricing',
                  data: {
                    prioritizeRule: 'exclude',
                    totalAmount: perDatas.reduce(
                      (sum, cur) => (sum + cur.amount, 0)
                    ),
                    departmentId: departmentId,
                    branchId: branchId,
                    products: perDatas.map(i => ({
                      itemId: i._id,
                      productId: i.productId,
                      quantity: i.quantity,
                      price: i.unitPrice
                    }))
                  },
                  isRPC: true,
                  defaultValue: {}
                });

                for (const item of perDatas) {
                  const discount = pricing[item._id];

                  if (discount) {
                    isSetPricing = true;

                    if (discount.type === 'percentage') {
                      item.discountPercent = parseFloat(
                        (
                          (discount.value / (item.unitPrice || 1)) *
                          100
                        ).toFixed(2)
                      );
                      item.discount = discount.value * item.quantity;
                      item.amount =
                        ((item.globalUnitPrice || item.unitPrice) -
                          discount.value) *
                        item.quantity;
                    } else {
                      item.discount = discount.value * item.quantity;
                      item.amount =
                        ((item.globalUnitPrice || item.unitPrice) -
                          discount.value) *
                        item.quantity;
                    }
                  }
                }
              }

              afterPricingData = afterPricingData.concat(perDatas);
            }
          }

          if (isSetPricing) {
            await sendCardsMessage({
              subdomain,
              action: 'deals.updateOne',
              data: {
                selector: { _id: deal._id },
                modifier: { $set: { productsData: afterPricingData } }
              },
              isRPC: true
            });
          }
        }
      }
    }
    return;
  }
};
