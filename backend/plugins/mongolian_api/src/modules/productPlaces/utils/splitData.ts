import * as _ from 'lodash';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getChildCategories, getChildTags } from './utils';
import crypto from 'node:crypto';

const checkSplit = async (
  subdomain,
  pdata,
  config,
  categoryIds,
  excludeCategoryIds,
  tagIds,
  excludeTagIds,
  productById,
) => {
  const product = productById[pdata.productId];

  if (!product?.subUoms?.length) {
    return;
  }

  const ratio = product.subUoms[0]?.ratio ?? 0;

  if (!ratio) {
    return;
  }

  const checkCount = Math.round((1 / ratio) * 100) / 100;

  if (checkCount < 1 || pdata.quantity < checkCount) {
    return;
  }

  let catRes = true;
  let segmentRes = true;
  let tagRes = true;

  if (config.excludeProductIds?.includes(product._id)) {
    return;
  }

  if (
    excludeCategoryIds?.length &&
    excludeCategoryIds.includes(product.categoryId)
  ) {
    return;
  }

  if (
    excludeTagIds?.length &&
    _.intersection(excludeTagIds, product.tagIds ?? []).length
  ) {
    return;
  }

  if (categoryIds?.length) {
    catRes = false;

    if (categoryIds.includes(product.categoryId)) {
      catRes = true;
    }
  }

  if (tagIds?.length) {
    tagRes = false;

    if (_.intersection(tagIds, product.tagIds ?? []).length) {
      tagRes = true;
    }
  }

  if (config.segmentIds?.length) {
    segmentRes = false;

    for (const segmentId of config.segmentIds) {
      const isInSegment = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'segment',
        action: 'isInSegment',
        method: 'query',
        input: {
          segmentId,
          idToCheck: pdata.productId,
        },
        defaultValue: false,
      });

      if (isInSegment) {
        segmentRes = true;
        break;
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
  productById,
) => {
  let pdatas = productsData.map((p) => ({ ...p }));

  let calcedCatIds: string[] = [];
  let calcedExcludeCatIds: string[] = [];
  let calcedTagIds: string[] = [];
  let calcedExcludeTagIds: string[] = [];

  if (config.productCategoryIds?.length || config.excludeCategoryIds?.length) {
    [calcedCatIds, calcedExcludeCatIds] = (await Promise.all([
      getChildCategories(subdomain, config.productCategoryIds ?? []),
      getChildCategories(subdomain, config.excludeCategoryIds ?? []),
    ])) as string[][];
  }

  if (config.productTagIds?.length || config.excludeTagIds?.length) {
    [calcedTagIds, calcedExcludeTagIds] = (await Promise.all([
      getChildTags(subdomain, config.productTagIds ?? []),
      getChildTags(subdomain, config.excludeTagIds ?? []),
    ])) as string[][];
  }

  for (const pdata of productsData) {
    const newCount = await checkSplit(
      subdomain,
      pdata,
      config,
      calcedCatIds,
      calcedExcludeCatIds,
      calcedTagIds,
      calcedExcludeTagIds,
      productById,
    );

    if (newCount) {
      const updateCount = pdata.quantity - newCount;
      const amount = newCount * pdata.unitPrice;
      const tax = (pdata.tax / pdata.quantity) * newCount;
      const discount = (pdata.discount / pdata.quantity) * newCount;

      pdatas = pdatas.map((pd) =>
        pd._id === pdata._id
          ? {
              ...pdata,
              quantity: updateCount,
              amount: pdata.amount - amount,
              tax: pdata.tax - tax,
              discount: pdata.discount - discount,
            }
          : pd,
      );

      pdatas.push({
        ...pdata,
        _id: crypto.randomUUID(),
        quantity: newCount,
        amount,
        tax,
        discount,
      });
    }
  }

  await sendTRPCMessage({
    subdomain,
    pluginName: 'sales',
    module: 'deal',
    action: 'updateOne',
    method: 'mutation',
    input: {
      selector: { _id: dealId },
      modifier: {
        $set: { productsData: pdatas },
      },
    },
  });

  return pdatas;
};
