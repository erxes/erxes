import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { SCORE_CAMPAIGN_STATUSES } from '~/modules/score/constants';
import { VOUCHER_STATUS } from '~/modules/voucher/constants';
import { IVoucherTarget } from '~/modules/voucher/@types/voucher';
import {
  AUTO_SALE_VOUCHER_TYPES,
  voucherExpiresAt,
  voucherTerms,
} from '~/modules/voucher/services/voucherTerm';
import { CAMPAIGN_STATUS } from '~/constants';

export const getChildCategories = async (subdomain: string, categoryIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'productCategories',
    action: 'withChilds',
    input: {
      ids: categoryIds,
    },
    defaultValue: [],
  });

  const catIds: string[] = (childs || []).map((ch) => ch._id) || [];

  return Array.from(new Set(catIds));
};

export const getChildTags = async (subdomain: string, tagIds) => {
  const childs = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'findWithChild',
    input: {
      query: { _id: { $in: tagIds } },
      field: { _id: 1 },
    },
    defaultValue: [],
  });

  const allTagIds: string[] = (childs || []).map((ch) => ch._id) || [];

  return Array.from(new Set(allTagIds));
};

interface IProductD {
  productId: string;
  quantity: number;
  unitPrice: number;
}

type DealProductScoreData = {
  amount?: number | string | null;
  count?: number | string | null;
  discount?: number | string | null;
  productId?: string | null;
  tickUsed?: boolean | null;
  unitPrice?: number | string | null;
};

// Core service helpers
async function coreQuery<T>(
  subdomain: string,
  module: string,
  action: string,
  input: any,
  defaultValue: T,
): Promise<T> {
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action,
    input,
    defaultValue,
  });
}

// Unified helper for fetching include/exclude for categories or tags
async function fetchIncludeExclude(
  subdomain: string,
  type: 'categories' | 'tags',
  includeIds: string[],
  excludeIds: string[],
): Promise<{ included: string[]; excluded: string[] }> {
  const [included, excluded] = await Promise.all([
    includeIds.length
      ? type === 'categories'
        ? getChildCategories(subdomain, includeIds)
        : getChildTags(subdomain, includeIds)
      : [],
    excludeIds.length
      ? type === 'categories'
        ? getChildCategories(subdomain, excludeIds)
        : getChildTags(subdomain, excludeIds)
      : [],
  ]);
  return { included, excluded };
}

// Apply restrictions
export const applyRestriction = async ({
  subdomain,
  restrictions,
  products,
}: {
  subdomain: string;
  restrictions: Record<string, any>;
  products: IProductD[];
}) => {
  const normalizeRestrictionIds = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.filter((id): id is string => typeof id === 'string' && !!id);
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }

    return [];
  };

  const categoryIds = normalizeRestrictionIds(
    restrictions?.categoryIds || restrictions?.productCategoryIds,
  );
  const excludeCategoryIds = normalizeRestrictionIds(
    restrictions?.excludeCategoryIds || restrictions?.excludeProductCategoryIds,
  );
  const productIds = normalizeRestrictionIds(restrictions?.productIds);
  const excludeProductIds = normalizeRestrictionIds(
    restrictions?.excludeProductIds,
  );
  // Voucher and coupon forms save tags as `tag` / `orExcludeTag`.
  const tagIds = normalizeRestrictionIds(
    restrictions?.tagIds || restrictions?.tag,
  );
  const excludeTagIds = normalizeRestrictionIds(
    restrictions?.excludeTagIds || restrictions?.orExcludeTag,
  );

  const inputProductsIds = products.map((p) => p.productId);

  const [catResult, tagResult] = await Promise.all([
    fetchIncludeExclude(
      subdomain,
      'categories',
      categoryIds,
      excludeCategoryIds,
    ),
    fetchIncludeExclude(subdomain, 'tags', tagIds, excludeTagIds),
  ]);

  const query: Record<string, any> = {
    _id: {
      $in: productIds.length ? productIds : inputProductsIds,
      $nin: excludeProductIds,
    },
  };

  if (catResult.included.length || catResult.excluded.length) {
    query.categoryId = {
      ...(catResult.included.length && { $in: catResult.included }),
      ...(catResult.excluded.length && { $nin: catResult.excluded }),
    };
  }

  if (tagResult.included.length || tagResult.excluded.length) {
    query.tagIds = {
      ...(tagResult.included.length && { $in: tagResult.included }),
      ...(tagResult.excluded.length && { $nin: tagResult.excluded }),
    };
  }

  const productDocs = await coreQuery(
    subdomain,
    'products',
    'find',
    { query },
    [],
  );
  const productMap = new Map(products.map((p) => [p.productId, p]));

  const totalAmount = productDocs.reduce((sum, { _id }) => {
    const item = productMap.get(_id);
    return sum + (item ? item.quantity * item.unitPrice : 0);
  }, 0);

  return { productDocs, restrictedAmount: totalAmount };
};

export const getAllowedProductIdsByRestrictions = async ({
  subdomain,
  restrictions,
  productsData,
}: {
  subdomain: string;
  restrictions?: Record<string, unknown>;
  productsData: DealProductScoreData[];
}) => {
  const hasRestrictions = Object.values(restrictions || {}).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return typeof value === 'string' && !!value.trim();
  });

  if (!hasRestrictions) {
    return undefined;
  }

  const productIds = productsData
    .map(({ productId }) => productId)
    .filter((productId): productId is string => !!productId);

  if (!productIds.length) {
    return undefined;
  }

  const { productDocs } = await applyRestriction({
    subdomain,
    restrictions: restrictions || {},
    products: productIds.map((productId) => ({
      productId,
      quantity: 0,
      unitPrice: 0,
    })),
  });

  return new Set(productDocs.map(({ _id }: { _id: string }) => _id));
};

// Helper for processing a single product discount (reduces duplication)
function processProductDiscount(
  result: any,
  product: any,
  products: IProductD[],
  kind: string,
  value: number,
  totalAmount: number,
) {
  const { _id } = product;
  const item = products.find((p) => p.productId === _id) || {};
  const discount = calculateDiscount({
    kind,
    value,
    product: { ...item, discount: result[_id]?.discount || 0 },
    totalAmount,
  });
  return { productId: _id, item, discount };
}

// Bonus vouchers give their product whenever it is in the sale; discount and
// reward vouchers are picked (`voucherId`), held for one order and used once.
export const directVoucher = async ({
  result,
  ownerType,
  ownerId,
  models,
  products,
}: {
  result: Record<string, any>;
  ownerType: string;
  ownerId: string;
  models: IModels;
  products: IProductD[];
}) => {
  const now = new Date();
  const productsIds = products.map((p) => p.productId);

  const vouchers = await models.Vouchers.find({
    ownerType,
    ownerId,
    status: VOUCHER_STATUS.NEW,
  }).lean();

  if (!vouchers.length) {
    return;
  }

  const campaigns = await models.VoucherCampaigns.find({
    _id: { $in: [...new Set(vouchers.map((v) => v.campaignId))] },
    status: CAMPAIGN_STATUS.ACTIVE,
  }).lean();
  const campaignById = new Map(campaigns.map((c) => [c._id, c]));

  for (const voucher of vouchers) {
    const campaign = campaignById.get(voucher.campaignId);

    if (!campaign) {
      continue;
    }

    const terms = voucherTerms(voucher, campaign);
    const expiresAt = voucherExpiresAt(voucher, campaign);

    if (
      !AUTO_SALE_VOUCHER_TYPES.includes(terms.voucherType || '') ||
      (expiresAt && expiresAt < now)
    ) {
      continue;
    }

    for (const productId of productsIds) {
      if (terms.bonusProductId !== productId) {
        continue;
      }

      result[productId].voucherCampaignId = voucher.campaignId;
      result[productId].voucherId = voucher._id;
      result[productId].potentialBonus +=
        (terms.bonusCount || 0) -
        (voucher.bonusInfo || []).reduce((sum, i) => sum + i.usedCount, 0);
      result[productId].type = 'bonus';
      result[productId].discount = 100;
      result[productId].bonusName = terms.title;
    }
  }
};

// Unified discount source applier (voucher/coupon)
async function applyDiscountSource(
  models: IModels,
  subdomain: string,
  sourceType: 'voucher' | 'coupon',
  sourceId: string,
  ownerType: string,
  ownerId: string,
  totalAmount: number,
  products: IProductD[],
  result: any,
  targetId?: string,
) {
  let source;
  if (sourceType === 'voucher') {
    // Free, or already held for (or used on) this very order.
    source = await models.Vouchers.checkVoucher({
      voucherId: sourceId,
      ownerType,
      ownerId,
      totalAmount,
      targetId,
    });
  } else {
    source = await models.Coupons.checkCoupon({
      code: sourceId,
      ownerId,
      totalAmount,
      targetId,
    });
  }
  await applyDiscountRule(
    models,
    subdomain,
    source,
    products,
    result,
    sourceType,
    sourceType === 'voucher' ? 'voucherCampaignId' : 'couponCampaignId',
    source._id,
    sourceId,
  );
}

// Discount rule applier (used for both voucher and coupon)
async function applyDiscountRule(
  models: IModels,
  subdomain: string,
  ruleSource: { title: string; kind: string; value: number; restrictions: any },
  products: IProductD[],
  result: any,
  type: 'voucher' | 'coupon',
  idField: string,
  idValue: string,
  sourceRef: string,
) {
  const { title, kind, value, restrictions = {} } = ruleSource;
  const { productDocs, restrictedAmount } = await applyRestriction({
    subdomain,
    restrictions,
    products,
  });
  for (const product of productDocs) {
    const { productId, discount } = processProductDiscount(
      result,
      product,
      products,
      kind,
      value,
      restrictedAmount,
    );
    result[productId] = {
      ...result[productId],
      [idField]: idValue,
      discount,
      voucherName: title,
      type,
      ...(type === 'voucher' ? { voucherId: sourceRef } : { coupon: idValue }),
    };
  }
}

// Main checkVouchersSale
export const checkVouchersSale = async (
  models: IModels,
  subdomain: string,
  ownerType: string,
  ownerId: string,
  products: IProductD[],
  discountInfo?: Record<string, string>,
) => {
  const result = {};
  // `targetId`: the order or deal being priced, so its own held voucher passes.
  const { couponCode, voucherId, targetId } = discountInfo || {};

  if (!ownerId && !products) {
    return 'No Data';
  }

  const totalAmount = products.reduce(
    (sum, product) => sum + product.quantity * product.unitPrice,
    0,
  );

  // Initialize result
  for (const product of products) {
    const { productId } = product;
    if (!result[productId]) {
      result[productId] = {
        voucherCampaignId: '',
        voucherId: '',
        potentialBonus: 0,
        discount: 0,
        sumDiscount: 0,
      };
    }
  }

  await directVoucher({
    result,
    ownerType,
    ownerId,
    models,
    products,
  });

  if (voucherId) {
    await applyDiscountSource(
      models,
      subdomain,
      'voucher',
      voucherId,
      ownerType,
      ownerId,
      totalAmount,
      products,
      result,
      targetId,
    );
  }

  if (couponCode) {
    await applyDiscountSource(
      models,
      subdomain,
      'coupon',
      couponCode,
      ownerType,
      ownerId,
      totalAmount,
      products,
      result,
    );
  }

  return result;
};

// Confirm voucher sale
export const confirmVoucherSale = async (
  models: IModels,
  subdomain: string,
  checkInfo: {
    [productId: string]: {
      voucherId?: string | null;
      count?: number | null;
    };
  },
  extraInfo?: {
    couponCode?: string | null;
    voucherId?: string | null;
    ownerType?: string | null;
    ownerId?: string | null;
    targetid?: string;
    targetId?: string;
    targetType?: string;
    serviceName?: string;
    totalAmount?: string | number;
    [key: string]: any;
  },
) => {
  const { couponCode, voucherId, totalAmount, ...usageInfo } = extraInfo || {};
  const targetId = extraInfo?.targetId || extraInfo?.targetid;
  const target: IVoucherTarget | undefined = targetId
    ? { targetType: extraInfo?.targetType || '', targetId }
    : undefined;

  if (couponCode) {
    await models.Coupons.redeemCoupon({ code: couponCode, usageInfo });
  }

  // Using it twice on the same order changes nothing; on another, it fails.
  if (voucherId) {
    await models.Vouchers.useVoucher({
      voucherId,
      ownerType: extraInfo?.ownerType || '',
      ownerId: extraInfo?.ownerId || '',
      target,
      userId: extraInfo?.userId,
    });
  }

  for (const productId of Object.keys(checkInfo)) {
    const rule = checkInfo[productId];
    if (!rule.voucherId || !rule.count) continue;

    await models.Vouchers.useBonus({
      voucherId: rule.voucherId,
      count: rule.count,
      target,
      userId: extraInfo?.userId,
    });
  }
};

// Segment check
export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  targetId: string,
) => {
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'segment',
    action: 'isInSegment',
    input: { segmentId, idToCheck: targetId },
    defaultValue: false,
  });
};

// Pages through core's materialised member list; one call returns at most a page.
export const fetchSegmentIds = async (
  subdomain: string,
  segmentId: string,
): Promise<string[]> => {
  const ids: string[] = [];
  let cursor: string | undefined;

  do {
    const page: { ids?: string[]; nextCursor?: string } =
      await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'segment',
        action: 'fetchSegment',
        input: { segmentId, cursor, limit: 1000 },
        defaultValue: { ids: [] },
      });

    ids.push(...(page.ids || []));
    cursor = page.nextCursor;
  } while (cursor);

  return ids;
};

export interface AssignmentCheckResponse {
  segmentId: string;
  isIn: boolean;
}

// Discount calculation
export const calculateDiscount = ({ kind, value, product, totalAmount }) => {
  try {
    if (kind === 'percent') {
      return Math.min((product?.discount || 0) + value, 100);
    }
    if (!product || !totalAmount) return 0;
    const productPrice = product.unitPrice * (product.quantity || 1);
    if (productPrice <= 0) return 0;
    const productDiscount = (productPrice / totalAmount) * value;
    const discount = (productDiscount / productPrice) * 100;
    return Math.min((product?.discount || 0) + discount, 100);
  } catch (error) {
    console.error('Error calculating discount:', error.message);
    return 0;
  }
};

// Loyalty reward (automations)
export const generateTargetTotalAmountDeal = (
  productsData: DealProductScoreData[] = [],
  options: {
    allowedProductIds?: Set<string>;
    discountCheck?: boolean;
    requireTickUsed?: boolean;
  } = {},
) =>
  productsData
    .filter((pdata) => !options.requireTickUsed || pdata.tickUsed === true)
    .filter(
      (pdata) =>
        !options.allowedProductIds ||
        options.allowedProductIds.has(pdata.productId || ''),
    )
    .filter(
      (pdata) =>
        !options.discountCheck || Math.abs(Number(pdata.discount) || 0) < 0.005,
    )
    .reduce(
      (sum, product) =>
        sum +
        (Number(product?.amount) ||
          (Number(product?.count) || 0) * (Number(product?.unitPrice) || 0)),
      0,
    );

export const handleLoyaltyOwnerChange = async (
  subdomain: string,
  models: IModels,
  ownerId: string,
  ownerIds: string[],
) => {
  await models.Vouchers.updateMany(
    { ownerId: { $in: ownerIds } },
    { $set: { ownerId } },
  );

  await models.Coupons.updateMany(
    { 'usageLogs.ownerId': { $in: ownerIds } },
    { $set: { 'usageLogs.$[elem].ownerId': ownerId } },
    { arrayFilters: [{ 'elem.ownerId': { $in: ownerIds } }] },
  );

  await models.ScoreLogs.updateMany(
    { ownerId: { $in: ownerIds } },
    { $set: { ownerId } },
  );

  const customer = await coreQuery(
    subdomain,
    'customers',
    'findOne',
    { query: { _id: ownerId } },
    {},
  );

  const scoreFieldIds = await models.ScoreCampaigns.find({
    status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
  }).distinct('fieldId');

  const fieldIds = new Set(scoreFieldIds);
  const propertiesData: Record<string, any> = {
    ...(customer as any)?.propertiesData,
  };
  const scoreFieldsData: Record<string, number> = {};

  for (const customFieldData of (customer as any)?.customFieldsData || []) {
    const { field, value, numberValue } = customFieldData || {};

    if (!fieldIds.has(field)) {
      if (propertiesData[field] === undefined) {
        propertiesData[field] = numberValue ?? value;
      }
      continue;
    }

    const numericValue = Number(numberValue ?? value ?? 0) || 0;
    scoreFieldsData[field] = (scoreFieldsData[field] || 0) + numericValue;
  }

  for (const fieldId of Object.keys(scoreFieldsData)) {
    propertiesData[fieldId] = scoreFieldsData[fieldId];
  }

  await models.ScoreCampaigns.updateOwnerScore({
    ownerId,
    ownerType: 'customer',
    updatedCustomFieldsData: propertiesData,
  });
};
