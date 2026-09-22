import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { checkCondition, getChildCategories, getChildTags } from './utils';

export const setPlace = async (
  subdomain,
  dealId,
  productsData,
  config,
  productById,
) => {
  if (!config.conditions?.length) {
    return productsData;
  }

  const pdatas = productsData.map((p) => ({ ...p }));

  const conditions = config.conditions
    .filter((c) => c.branchId || c.departmentId)
    .map((c) => ({ ...c }));

  await Promise.all(
    conditions.map(async (condition) => {
      if (
        condition.productCategoryIds?.length ||
        condition.excludeCategoryIds?.length
      ) {
        const [includeCatIds, excludeCatIds] = await Promise.all([
          getChildCategories(subdomain, condition.productCategoryIds),
          getChildCategories(subdomain, condition.excludeCategoryIds ?? []),
        ]);

        condition.calcedCatIds = includeCatIds;
        condition.calcedExcludeCatIds = excludeCatIds;
      } else {
        condition.calcedCatIds = [];
        condition.calcedExcludeCatIds = [];
      }

      if (condition.productTagIds?.length || condition.excludeTagIds?.length) {
        const [includeTagIds, excludeTagIds] = await Promise.all([
          getChildTags(subdomain, condition.productTagIds),
          getChildTags(subdomain, condition.excludeTagIds ?? []),
        ]);

        condition.calcedTagIds = includeTagIds;
        condition.calcedExcludeTagIds = excludeTagIds;
      } else {
        condition.calcedTagIds = [];
        condition.calcedExcludeTagIds = [];
      }
    }),
  );

  for (const pdata of pdatas) {
    for (const condition of conditions) {
      const matches = await checkCondition(
        subdomain,
        pdata,
        condition,
        productById,
      );

      if (matches) {
        pdata.branchId = condition.branchId;
        pdata.departmentId = condition.departmentId;
      }
    }
  }

  const branchIds = [...new Set(pdatas.map((p) => p.branchId).filter(Boolean))];
  const departmentIds = [
    ...new Set(pdatas.map((p) => p.departmentId).filter(Boolean)),
  ];

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deal',
    action: 'updateOne',
    method: 'mutation',
    input: {
      selector: { _id: dealId },
      modifier: {
        $set: {
          productsData: pdatas,
          branchIds,
          departmentIds,
        },
      },
    },
  });

  return pdatas;
};
