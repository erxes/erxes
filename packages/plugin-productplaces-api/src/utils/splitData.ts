import {
  sendCardsMessage,
  sendProductsMessage,
  sendSegmentsMessage
} from '../messageBroker';
import { getChildCategories } from './utils';

const checkSplit = async (
  subdomain,
  pdata,
  config,
  categoryIds,
  productById
) => {
  const product = productById[pdata.productId];

  if (!product.subUoms || !product.subUoms.length) {
    return;
  }

  const ratio = product.subUoms[0].ratio || 0;

  if (!ratio) {
    return;
  }

  const checkCount = Math.round((1 / ratio) * 100) / 100;

  if (checkCount < 1) {
    return;
  }

  if (pdata.quantity < checkCount) {
    return;
  }

  let catRes = true;
  let segmentRes = true;

  if (categoryIds && categoryIds.length) {
    catRes = false;
    if (
      !(config.excludeProductIds || []).includes(product._id) &&
      categoryIds.includes(product.categoryId)
    ) {
      catRes = true;
    }
  }

  if (config.segmentIds && config.segmentIds.length) {
    segmentRes = false;
    for (const segmentId of config.segmentIds) {
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

  if (!(catRes && segmentRes)) {
    return;
  }

  const packageCount = Math.floor(pdata.quantity / checkCount);

  return pdata.quantity - packageCount * checkCount;
};

export const splitData = async (
  subdomain,
  dealId,
  productsData,
  config,
  productById
) => {
  let pdatas = [...productsData];
  let calcedCatIds = [];

  if (config.productCategoryIds && config.productCategoryIds.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      config.productCategoryIds
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      config.excludedCategoryIds || []
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

    calcedCatIds = (productCategories || []).map(pc => pc._id);
  }

  for (const pdata of productsData) {
    const newCount: number | undefined = await checkSplit(
      subdomain,
      pdata,
      config,
      calcedCatIds,
      productById
    );

    if (newCount) {
      const updateCount = pdata.quantity - newCount;
      const amount = newCount * pdata.unitPrice;
      const tax = (pdata.tax / pdata.quantity) * newCount;
      const discount = (pdata.discount / pdata.quantity) * newCount;

      pdatas = pdatas.map(pd =>
        pd._id === pdata._id
          ? {
              ...pdata,
              quantity: updateCount,
              amount: pdata.amount - amount,
              tax: pdata.tax - tax,
              discount: pdata.discount - discount
            }
          : pd
      );

      pdatas.push({
        ...pdata,
        _id: Math.random().toString(),
        quantity: newCount,
        amount,
        tax,
        discount
      });
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
