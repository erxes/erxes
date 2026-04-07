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

  // Avoid mutating original data
  const pdatas = productsData.map((p) => ({ ...p }));

  //  Clone conditions to avoid side effects
  const conditions = config.conditions
    .filter((c) => c.branchId || c.departmentId)
    .map((c) => ({ ...c }));

  // Pre-calculate category & tag conditions (parallelized)
  await Promise.all(
    conditions.map(async (condition) => {
      // Categories
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

      // Tags
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

  //  Apply conditions to products
  for (const pdata of pdatas) {
    for (const condition of conditions) {
      const matches = await checkCondition(
        subdomain,
        pdata,
        condition,
        productById,
      );

      // Optional debug logging (safe)
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔥 CHECK CONDITION:', {
          productId: pdata.productId,
          matches,
          condition,
        });
      }

      if (matches) {
        pdata.branchId = condition.branchId;
        pdata.departmentId = condition.departmentId;
        break;
      }
    }
  }

  // Collect unique IDs
  const branchIds = [...new Set(pdatas.map((p) => p.branchId).filter(Boolean))];
  const departmentIds = [
    ...new Set(pdatas.map((p) => p.departmentId).filter(Boolean)),
  ];

  // Safe API call with proper error handling
  try {
    const result = await sendTRPCMessage({
      subdomain,
      pluginName: 'sales',
      module: 'deal',
      action: 'editItem',
      method: 'mutation',
      input: {
        itemId: dealId,
        processId: processId || 'manual-update',
        user: userId,
        productsData: pdatas,
        branchIds,
        departmentIds,
      },
    });

    if (result?.status === 'error') {
      console.error('Failed to update deal:', result);
      // Optional: throw if this should break flow
      // throw new Error(result.message || 'Deal update failed');
    }
  } catch (error) {
    console.error('setPlace error:', error);
    // Optional: rethrow if upstream needs to handle it
    // throw error;
  }

  return pdatas;
};