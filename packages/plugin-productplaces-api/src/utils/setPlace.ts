import { sendCardsMessage } from '../messageBroker';
import { checkCondition, getChildCategories, getChildTags } from './utils';

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
    if (condition.productCategoryIds && condition.productCategoryIds.length) {
      const includeCatIds = await getChildCategories(
        subdomain,
        condition.productCategoryIds
      );
      const excludeCatIds = await getChildCategories(
        subdomain,
        condition.excludeCategoryIds || []
      );

      condition.calcedCatIds = includeCatIds.filter(
        c => !excludeCatIds.includes(c)
      );
    } else {
      condition.calcedCatIds = [];
    }

    if (condition.productTagIds && condition.productTagIds.length) {
      const includeTagIds = await getChildTags(
        subdomain,
        condition.productTagIds
      );
      const excludeTagIds = await getChildTags(
        subdomain,
        condition.excludeTagIds || []
      );

      condition.calcedTagIds = includeTagIds.filter(
        c => !excludeTagIds.includes(c)
      );
    } else {
      condition.calcedTagIds = [];
    }
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
