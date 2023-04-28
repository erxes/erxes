import { sendCardsMessage, sendProductsMessage } from '../messageBroker';
import { checkCondition, getChildCategories } from './utils';

export const setPlace = async (
  subdomain,
  dealId,
  productsData,
  config,
  productById
) => {
  if (!(config.conditions && config.conditions.length)) {
    return productsData;
  }

  // split productsData
  const pdatas = productsData;

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
      selector: { _id: dealId },
      modifier: { $set: { productsData: pdatas } }
    },
    isRPC: true
  });

  return pdatas;
};
