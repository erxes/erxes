import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { checkCondition, getChildCategories, getChildTags } from './utils';

export const setPlace = async (
  subdomain,
  dealId,
  productsData,
  config,
  productById,
) => {
  console.log('🔥 setPlace RUNNING', {
    dealId,
    productsDataCount: productsData.length,
    configConditionsCount: config.conditions?.length,
  });
  if (!config.conditions?.length) {
    console.log('🔥 setPlace: no conditions, returning early');
    return productsData;
  }

  const pdatas = productsData;

  const conditions = config.conditions.filter(
    (c) => c.branchId || c.departmentId,
  );
  console.log(
    '🔥 setPlace: filtered conditions with branch/department',
    conditions.map((c) => ({
      branchId: c.branchId,
      departmentId: c.departmentId,
      productCategoryIds: c.productCategoryIds,
      productTagIds: c.productTagIds,
      excludeCategoryIds: c.excludeCategoryIds,
      excludeTagIds: c.excludeTagIds,
    })),
  );
  for (const condition of conditions) {
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
      console.log('🔥 setPlace condition category calc', {
        conditionId: condition.id,
        includeCatIds,
        excludeCatIds,
        calcedCatIds: condition.calcedCatIds,
      });
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
      console.log('🔥 setPlace condition tag calc', {
        conditionId: condition.id,
        includeTagIds,
        excludeTagIds,
        calcedTagIds: condition.calcedTagIds,
      });
    } else {
      condition.calcedTagIds = [];
    }
  }

  console.log(
    '🔥 setPlace conditions:',
    conditions.map((c) => ({
      branchId: c.branchId,
      departmentId: c.departmentId,
      catIds: c.calcedCatIds,
      tagIds: c.calcedTagIds,
    })),
  );

  for (const pdata of pdatas) {
    console.log(`🔥 setPlace checking pdata ${pdata._id}`, {
      productId: pdata.productId,
      currentBranchId: pdata.branchId,
      currentDepartmentId: pdata.departmentId,
    });
    for (const condition of conditions) {
      const matches = await checkCondition(
        subdomain,
        pdata,
        condition,
        productById,
      );
      console.log(`🔥 setPlace condition match? ${matches}`, {
        conditionId: condition.id,
        branchId: condition.branchId,
        departmentId: condition.departmentId,
        productId: pdata.productId,
      });
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
  console.log('🔥 setPlace aggregated branchIds', branchIds);
  console.log('🔥 setPlace aggregated departmentIds', departmentIds);

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deals',
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
  console.log('🔥 setPlace updateOne sent for deal', dealId);

  return pdatas;
};
