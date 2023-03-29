import { sendCardsMessage, sendProductsMessage } from './messageBroker';
import { checkCondition, getChildCategories, getConfig } from './utils/utils';

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

      const configs = await getConfig(subdomain, 'dealsProductsDataPlaces', {});

      // nothing
      if (!Object.keys(configs).includes(destinationStageId)) {
        return;
      }

      const config = configs[destinationStageId];

      if (!(config.conditions && config.conditions.length)) {
        return;
      }

      // split productsData
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

      const conditions = config.conditions.filter(
        c => c.branchId || c.departmentId
      );

      // const categoryIds =
      for (const condition of conditions) {
        if (
          !(condition.productCategoryIds && condition.productCategoryIds.length)
        ) {
          condition.calcedCatIds = [];
          continue;
        }

        const includeCatIds = await getChildCategories(
          subdomain,
          condition.productCategoryIds
        );
        const excludeCatIds = await getChildCategories(
          subdomain,
          condition.excludedCategoryIds || []
        );

        const productCategoryIds = includeCatIds.filter(
          c => !excludeCatIds.includes(c)
        );

        const productCategories = await sendProductsMessage({
          subdomain,
          action: 'categories.find',
          data: {
            query: { _id: { $in: productCategoryIds } },
            sort: { order: 1 }
          },
          isRPC: true,
          defaultValue: []
        });

        condition.calcedCatIds = (productCategories || []).map(pc => pc._id);
      }

      for (const pdata of pdatas) {
        for (const condition of conditions) {
          if (await checkCondition(subdomain, pdata, condition, productById)) {
            pdata.branchId = condition.branchId;
            pdata.departmentId = condition.departmentId;
            continue;
          }
        }
      }

      await sendCardsMessage({
        subdomain,
        action: 'deals.updateOne',
        data: {
          selector: { _id: deal._id },
          modifier: { $set: { productsData: pdatas } }
        },
        isRPC: true
      });

      return;
    }
    return;
  }
};
