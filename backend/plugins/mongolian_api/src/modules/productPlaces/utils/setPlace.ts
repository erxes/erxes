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
  console.log('🟢 [setPlace] START');
  console.log('dealId:', dealId);

  if (!config.conditions?.length) {
    console.log('❌ No conditions in config');
    return productsData;
  }

  console.log('conditions count:', config.conditions.length);

  const pdatas = productsData;

  const conditions = config.conditions.filter(
    (c) => c.branchId || c.departmentId,
  );

  console.log('valid conditions:', conditions.length);

  for (const condition of conditions) {
    console.log('processing condition:', condition);

    if (condition.productCategoryIds?.length) {
      const includeCatIds = await getChildCategories(
        subdomain,
        condition.productCategoryIds,
      );

      const excludeCatIds = await getChildCategories(
        subdomain,
        condition.excludeCategoryIds ?? [],
      );

      condition.calcedCatIds = includeCatIds.filter(
        (c) => !excludeCatIds.includes(c),
      );

      console.log('calcedCatIds:', condition.calcedCatIds);
    } else {
      condition.calcedCatIds = [];
    }

    if (condition.productTagIds?.length) {
      const includeTagIds = await getChildTags(
        subdomain,
        condition.productTagIds,
      );

      const excludeTagIds = await getChildTags(
        subdomain,
        condition.excludeTagIds ?? [],
      );

      condition.calcedTagIds = includeTagIds.filter(
        (c) => !excludeTagIds.includes(c),
      );

      console.log('calcedTagIds:', condition.calcedTagIds);
    } else {
      condition.calcedTagIds = [];
    }
  }

  console.log('productsData before matching:', JSON.stringify(pdatas, null, 2));

  for (const pdata of pdatas) {
    console.log('checking product:', pdata.productId);

    for (const condition of conditions) {
      const matches = await checkCondition(
        subdomain,
        pdata,
        condition,
        productById,
      );

      console.log('condition match result:', matches);

      if (matches) {
        console.log('✅ MATCH FOUND');

        pdata.branchId = condition.branchId;
        pdata.departmentId = condition.departmentId;

        console.log('assigned branchId:', pdata.branchId);
        console.log('assigned departmentId:', pdata.departmentId);

        break;
      }
    }
  }

  console.log('productsData after matching:', JSON.stringify(pdatas, null, 2));

  const branchIds = [...new Set(pdatas.map((p) => p.branchId).filter(Boolean))];
  const departmentIds = [
    ...new Set(pdatas.map((p) => p.departmentId).filter(Boolean)),
  ];

  console.log('branchIds:', branchIds);
  console.log('departmentIds:', departmentIds);

  console.log('🔵 updating deal through TRPC');

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

    console.log('🔵 deal.editItem response:', JSON.stringify(result, null, 2));

    if (result?.status === 'error') {
      console.error('❌ deal update failed:', result.errorMessage);
    } else {
      console.log('✅ deal updated');
    }
  } catch (error) {
    console.error('❌ deal update threw exception:', error);
  }

  console.log('🟢 [setPlace] END');

  return pdatas;
};
