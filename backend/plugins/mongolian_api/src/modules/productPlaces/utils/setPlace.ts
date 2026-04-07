import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { checkCondition, getChildCategories, getChildTags } from './utils';

export const setPlace = async (
  subdomain,
  dealId,
  productsData,
  config,
  productById,
  userId,
  processId,
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
      if (condition.productCategoryIds?.length) {
        const [includeCatIds, excludeCatIds] = await Promise.all([
          getChildCategories(subdomain, condition.productCategoryIds),
          getChildCategories(subdomain, condition.excludeCategoryIds ?? []),
        ]);

        condition.calcedCatIds = includeCatIds.filter(
          (c) => !excludeCatIds.includes(c),
        );
      } else {
        condition.calcedCatIds = [];
      }

      if (condition.productTagIds?.length) {
        const [includeTagIds, excludeTagIds] = await Promise.all([
          getChildTags(subdomain, condition.productTagIds),
          getChildTags(subdomain, condition.excludeTagIds ?? []),
        ]);

        condition.calcedTagIds = includeTagIds.filter(
          (c) => !excludeTagIds.includes(c),
        );
      } else {
        condition.calcedTagIds = [];
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
        break;
      }
    }
  }

  const branchIds = [...new Set(pdatas.map((p) => p.branchId).filter(Boolean))];
  const departmentIds = [
    ...new Set(pdatas.map((p) => p.departmentId).filter(Boolean)),
  ];

  try {
    const result = await sendTRPCMessage({
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

    if (result?.status === 'error') {
      throw new Error(result.message || 'Failed to update deal');
    }
  } catch (error) {
    throw error;
  }

  return pdatas;
};
