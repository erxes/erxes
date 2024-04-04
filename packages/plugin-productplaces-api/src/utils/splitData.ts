import * as _ from 'lodash';
import { sendCardsMessage, sendSegmentsMessage } from '../messageBroker';
import { getChildCategories, getChildTags } from './utils';

const checkSplit = async (
  subdomain,
  pdata,
  config,
  categoryIds,
  tagIds,
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
  let tagRes = true;

  if (categoryIds && categoryIds.length) {
    catRes = false;
    if (
      !(config.excludeProductIds || []).includes(product._id) &&
      categoryIds.includes(product.categoryId)
    ) {
      catRes = true;
    }
  }

  if (tagIds && tagIds.length) {
    tagRes = false;
    if (
      !(config.excludeProductIds || []).includes(product._id) &&
      _.intersection(tagIds, product.tagIds).length
    ) {
      tagRes = true;
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

  if (!(catRes && segmentRes && tagRes)) {
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
  let calcedCatIds: string[] = [];
  let calcedTagIds: string[] = [];

  if (config.productCategoryIds && config.productCategoryIds.length) {
    const includeCatIds = await getChildCategories(
      subdomain,
      config.productCategoryIds
    );
    const excludeCatIds = await getChildCategories(
      subdomain,
      config.excludeCategoryIds || []
    );

    calcedCatIds = includeCatIds.filter(c => !excludeCatIds.includes(c));
  }

  if (config.productTagIds && config.productTagIds.length) {
    const includeCatIds = await getChildTags(subdomain, config.productTagIds);
    const excludeCatIds = await getChildTags(
      subdomain,
      config.excludeTagIds || []
    );

    calcedTagIds = includeCatIds.filter(c => !excludeCatIds.includes(c));
  }

  for (const pdata of productsData) {
    const newCount: number | undefined = await checkSplit(
      subdomain,
      pdata,
      config,
      calcedCatIds,
      calcedTagIds,
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
