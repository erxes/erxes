import {
  sendCoreMessage,
  sendProductsMessage,
  sendSegmentsMessage
} from '../messageBroker';

export const getConfig = async (subdomain, code, defaultValue?) => {
  return await sendCoreMessage({
    subdomain,
    action: 'getConfig',
    data: { code, defaultValue },
    isRPC: true
  });
};

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendProductsMessage({
    subdomain,
    action: 'categories.withChilds',
    data: { ids: categoryIds },
    isRPC: true,
    defaultValue: []
  });

  const catIds: string[] = (childs || []).map(ch => ch._id) || [];
  return Array.from(new Set(catIds));
};

export const checkCondition = async (
  subdomain,
  pdata,
  condition,
  productById
) => {
  let categoryRes = true;
  let segmentRes = true;
  let numberRes = true;
  let checkUomRes = true;

  if (
    condition.gtCount ||
    condition.ltCount ||
    condition.gtUnitPrice ||
    condition.ltUnitPrice
  ) {
    numberRes = false;

    if (condition.gtCount) {
      if (pdata.quantity <= condition.gtCount) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.ltCount) {
      if (pdata.quantity >= condition.ltCount) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.gtUnitPrice) {
      if (pdata.unitPrice <= condition.gtUnitPrice) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }

    if (condition.ltUnitPrice) {
      if (pdata.unitPrice >= condition.ltUnitPrice) {
        numberRes = true;
      } else {
        numberRes = false;
      }
    }
  }

  if (!numberRes) {
    return false;
  }

  if (condition.subUomType) {
    checkUomRes = false;
    const product = productById[pdata.productId];
    if (product.subUoms && product.subUoms.length) {
      const ratio = product.subUoms[0].ratio || 0;
      if (ratio) {
        const checkCount = Math.round((1 / ratio) * 100) / 100;
        if (
          (condition.subUomType === 'lt' && pdata.quantity < checkCount) ||
          (condition.subUomType === 'gte' && pdata.quantity >= checkCount)
        ) {
          checkUomRes = true;
        }
      }
    } else {
      checkUomRes = true;
    }
  }

  if (!checkUomRes) {
    return false;
  }

  if (condition.productCategoryIds && condition.productCategoryIds.length) {
    categoryRes = false;
    const product = productById[pdata.productId];

    if (
      !(condition.excludeProductIds || []).includes(product._id) &&
      condition.calcedCatIds.includes(product.categoryId)
    ) {
      categoryRes = true;
    }
  }

  if (!categoryRes) {
    return false;
  }

  if (condition.segmentIds && condition.segmentIds.length) {
    segmentRes = false;
    for (const segmentId of condition.segmentIds) {
      if (
        await sendSegmentsMessage({
          subdomain,
          action: 'isInSegment',
          data: { segmentId, idToCheck: pdata.productId }
        })
      ) {
        segmentRes = true;
        continue;
      }
    }
  }

  if (!segmentRes) {
    return false;
  }

  return categoryRes && segmentRes && numberRes && checkUomRes;
};
