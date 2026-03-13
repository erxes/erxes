import {
  getEnv,
  getSaasOrganizations,
  isEnabled,
} from 'erxes-api-shared/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils/trpc';
import { IModels } from '~/connectionResolvers';
import { collections } from '../constants';
import { VOUCHER_STATUS } from '~/modules/voucher/constants';

interface IProductD {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const availableVoucherTypes = ['bonus', 'discount'];

// Core service helpers (reduce duplication)
async function coreQuery<T>(
  subdomain: string,
  module: string,
  action: string,
  input: any,
  defaultValue: T
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

async function fetchChildItems(
  subdomain: string,
  type: 'categories' | 'tags',
  ids: string[]
): Promise<string[]> {
  const action = 'withChilds';
  const module = type;
  const input = type === 'categories' ? { ids } : { query: { _id: { $in: ids } } };
  const items = await coreQuery(subdomain, module, action, input, []);
  return Array.from(new Set((items || []).map((ch: any) => ch._id)));
}

export const getChildCategories = (subdomain: string, categoryIds: string[]) =>
  fetchChildItems(subdomain, 'categories', categoryIds);

export const getChildTags = (subdomain: string, tagIds: string[]) =>
  fetchChildItems(subdomain, 'tags', tagIds);

// Restriction application
export const applyRestriction = async ({
  subdomain,
  restrictions,
  products,
}: {
  subdomain: string;
  restrictions: Record<string, any>;
  products: IProductD[];
}) => {
  const {
    categoryIds = [],
    excludeCategoryIds = [],
    productIds = [],
    excludeProductIds = [],
    tagIds = [],
    excludeTagIds = [],
  } = restrictions || {};

  const inputProductsIds = products.map((p) => p.productId);

  const [includedCategoryIds, excludedCategoryIds] = await Promise.all([
    categoryIds.length ? getChildCategories(subdomain, categoryIds) : [],
    excludeCategoryIds.length ? getChildCategories(subdomain, excludeCategoryIds) : [],
  ]);

  const [includedTagIds, excludedTagIds] = await Promise.all([
    tagIds.length ? getChildTags(subdomain, tagIds) : [],
    excludeTagIds.length ? getChildTags(subdomain, excludeTagIds) : [],
  ]);

  const query: Record<string, any> = {
    _id: {
      $in: productIds.length ? productIds : inputProductsIds,
      $nin: excludeProductIds,
    },
  };

  if (includedCategoryIds.length || excludedCategoryIds.length) {
    query.categoryId = {
      ...(includedCategoryIds.length && { $in: includedCategoryIds }),
      ...(excludedCategoryIds.length && { $nin: excludedCategoryIds }),
    };
  }

  if (includedTagIds.length || excludedTagIds.length) {
    query.tagIds = {
      ...(includedTagIds.length && { $in: includedTagIds }),
      ...(excludedTagIds.length && { $nin: excludedTagIds }),
    };
  }

  const productDocs = await coreQuery(subdomain, 'products', 'find', { query }, []);
  const productMap = new Map(products.map((p) => [p.productId, p]));

  const totalAmount = productDocs.reduce((sum, { _id }) => {
    const item = productMap.get(_id);
    return sum + (item ? item.quantity * item.unitPrice : 0);
  }, 0);

  return { productDocs, restrictedAmount: totalAmount };
};

// ------------------------------------------------------
// Voucher helpers
// ------------------------------------------------------
async function processVoucherBonus(voucher: any, productsIds: string[], result: any) {
  for (const productId of productsIds) {
    if (voucher.campaign.bonusProductId === productId) {
      result[productId].voucherCampaignId = voucher.campaignId;
      result[productId].voucherId = voucher._id;
      result[productId].potentialBonus +=
        voucher.campaign.bonusCount -
        (voucher.bonusInfo || []).reduce((sum, i) => sum + i.usedCount, 0);
      result[productId].type = 'bonus';
      result[productId].discount = 100;
      result[productId].bonusName = voucher.campaign.title;
    }
  }
}

async function processVoucherDiscount(
  voucher: any,
  subdomain: string,
  products: IProductD[],
  result: any
) {
  const { title, kind, value, restrictions } = voucher.campaign;
  const { productDocs, restrictedAmount } = await applyRestriction({
    subdomain,
    restrictions,
    products,
  });
  for (const product of productDocs) {
    const { _id } = product;
    const item = products.find((p) => p.productId === _id) || {};
    const discount = calculateDiscount({
      kind,
      value,
      product: { ...item, discount: result[_id].discount || 0 },
      totalAmount: restrictedAmount,
    });
    result[_id] = {
      ...result[_id],
      voucherCampaignId: voucher.campaignId,
      voucherId: voucher._id,
      discount,
      voucherName: title,
      type: 'discount',
      sumDiscount: result[_id].sumDiscount + discount,
    };
  }
}

export const directVoucher = async ({
  result,
  ownerType,
  ownerId,
  models,
  subdomain,
  products,
}) => {
  const NOW = new Date();
  const productsIds = products.map((p) => p.productId);
  const activeCampaignIds = await models.Vouchers.find({
    ownerType,
    ownerId,
    status: { $in: ['new'] },
  }).distinct('campaignId');

  for (const voucherType of availableVoucherTypes) {
    const campaigns = await models.VoucherCampaigns.find({
      _id: { $in: activeCampaignIds },
      finishDateOfUse: { $gte: NOW },
      voucherType: { $in: [voucherType] },
    }).lean();

    const vouchers = await models.Vouchers.aggregate([
      {
        $match: {
          ownerType,
          ownerId,
          status: { $in: ['new'] },
          campaignId: { $in: campaigns.map((c) => c._id) },
        },
      },
      {
        $lookup: {
          from: 'voucher_campaigns',
          localField: 'campaignId',
          foreignField: '_id',
          as: 'campaign_doc',
        },
      },
      {
        $project: {
          campaignId: 1,
          createdAt: 1,
          modifiedAt: 1,
          usedAt: 1,
          userId: 1,
          ownerType: 1,
          ownerId: 1,
          campaign: { $arrayElemAt: ['$campaign_doc', 0] },
          bonusInfo: 1,
        },
      },
    ]);

    for (const voucher of vouchers) {
      if (voucherType === 'bonus') {
        await processVoucherBonus(voucher, productsIds, result);
      } else {
        await processVoucherDiscount(voucher, subdomain, products, result);
      }
    }
  }
};

// Discount rule applier (used for both voucher and coupon)
async function applyDiscountRule(
  models: IModels,
  subdomain: string,
  ruleSource: { title: string; kind: string; value: number; restrictions: any },
  products: IProductD[],
  result: any,
  type: 'voucher' | 'coupon',
  idField: string,
  idValue: string
) {
  const { title, kind, value, restrictions = {} } = ruleSource;
  const { productDocs, restrictedAmount } = await applyRestriction({ subdomain, restrictions, products });
  for (const product of productDocs) {
    const { _id } = product;
    const item = products.find((p) => p.productId === _id) || {};
    const discount = calculateDiscount({
      kind,
      value,
      product: { ...item, discount: result[_id].discount || 0 },
      totalAmount: restrictedAmount,
    });
    result[_id] = {
      ...result[_id],
      [idField]: idValue,
      discount,
      voucherName: title, // kept for backward compatibility
      type,
      ...(type === 'voucher' ? { voucherId: idValue } : { coupon: idValue }),
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
  discountInfo?: Record<string, string>
) => {
  const result = {};
  const { couponCode, voucherId } = discountInfo || {};

  if (!ownerId && !products) {
    return 'No Data';
  }

  if (ownerType === 'customer') {
    const customerRelatedClientPortalUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'clientportal',
      method: 'query',
      module: 'clientPortalUsers',
      action: 'findOne',
      input: {
        $or: [{ _id: ownerId }, { erxesCustomerId: ownerId }],
      },
      defaultValue: null,
    });
    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = 'cpUser';
    }
  }

  const totalAmount = products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0);

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

  await directVoucher({ result, ownerType, ownerId, models, subdomain, products });

  if (voucherId) {
    const voucherCampaign = await models.Vouchers.checkVoucher({ voucherId, ownerType, ownerId });
    await models.Vouchers.checkVoucher({ voucherId, ownerType, ownerId, totalAmount });
    await applyDiscountRule(
      models,
      subdomain,
      voucherCampaign,
      products,
      result,
      'voucher',
      'voucherCampaignId',
      voucherCampaign._id
    );
  }

  if (couponCode) {
    const couponCampaign = await models.Coupons.checkCoupon({ code: couponCode, ownerId });
    await models.Coupons.checkCoupon({ code: couponCode, ownerId, totalAmount });
    await applyDiscountRule(
      models,
      subdomain,
      couponCampaign,
      products,
      result,
      'coupon',
      'couponCampaignId',
      couponCampaign._id
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
      voucherId: string;
      count: number;
    };
  },
  extraInfo?: {
    couponCode?: string;
    voucherId?: string;
    ownerType?: string;
    ownerId?: string;
    targetid?: string;
    serviceName?: string;
    totalAmount?: string;
  }
) => {
  const { couponCode, voucherId, totalAmount, ...usageInfo } = extraInfo || {};

  if (extraInfo?.ownerType === 'customer' && extraInfo?.ownerId) {
    const customerRelatedClientPortalUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'clientportal',
      method: 'query',
      module: 'clientPortalUsers',
      action: 'findOne',
      input: { erxesCustomerId: extraInfo.ownerId },
      defaultValue: null,
    });
    if (customerRelatedClientPortalUser) {
      usageInfo.ownerId = customerRelatedClientPortalUser._id;
      usageInfo.ownerType = 'cpUser';
    }
  }

  if (couponCode) {
    await models.Coupons.redeemCoupon({ code: couponCode, usageInfo });
  }

  if (voucherId) {
    await models.Vouchers.redeemVoucher({ voucherId, usageInfo });
  }

  for (const productId of Object.keys(checkInfo)) {
    const rule = checkInfo[productId];
    if (!rule.voucherId || !rule.count) continue;

    const voucher = await models.Vouchers.findOne({ _id: rule.voucherId }).lean();
    if (!voucher) continue;

    const campaign = await models.VoucherCampaigns.findOne({ _id: voucher.campaignId });
    if (!campaign) continue;

    const oldBonusCount = (voucher.bonusInfo || []).reduce((sum, i) => sum + i.usedCount, 0);
    const updateInfo: any = { $push: { bonusInfo: { usedCount: rule.count } } };
    if (campaign.bonusCount - oldBonusCount <= rule.count) {
      updateInfo.$set = { status: VOUCHER_STATUS.LOSS };
    }
    await models.Vouchers.updateOne({ _id: rule.voucherId }, updateInfo);
  }
};

// Segment check
export const isInSegment = async (subdomain: string, segmentId: string, targetId: string) => {
  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'segments',
    action: 'isInSegment',
    input: { segmentId, idToCheck: targetId },
    defaultValue: false,
  });
};

export interface AssignmentCheckResponse {
  segmentId: string;
  isIn: boolean;
}

// Attribute extraction (safe regex, length limited)
export const generateAttributes = (value: string) => {
  // Security: regex /\{\{\s*([^}]+)\s*\}\}/g is safe.
  // - Uses negated character class [^}]+ – no nested quantifiers.
  // - Additional safeguard: input length limited to 5000 characters.
  const MAX_LENGTH = 5000;
  if (!value || value.length > MAX_LENGTH) return [];
  const matches = value.match(/\{\{\s*([^}]+)\s*\}\}/g);
  return matches ? matches.map((match) => match.replace(/\{\{\s*|\s*\}\}/g, '')) : [];
};

// Safe arithmetic evaluator (no eval, no mathjs)
function safeEval(expression: string, scope: Record<string, number>): number {
  const allowedPattern = /^[0-9\s\+\-\*\/\(\)\.]+$/;
  if (!allowedPattern.test(expression)) {
    throw new Error(
      'Invalid expression: only numbers, operators (+, -, *, /), and parentheses allowed',
    );
  }
  const paramNames = Object.keys(scope);
  const paramValues = paramNames.map(name => scope[name]);
  const fn = new Function(...paramNames, `return (${expression});`);
  try {
    const result = fn(...paramValues);
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      throw new Error('Invalid numeric result');
    }
    return result;
  } catch (err) {
    throw new Error(`Evaluation error: ${err.message}`);
  }
}

// Score handling
export const handleScore = async (models: IModels, data) => {
  const { action, ownerId, ownerType, campaignId, target, description } = data;
  const scoreCampaign = await models.ScoreCampaigns.findOne({ _id: campaignId });
  if (!scoreCampaign) throw new Error('Not found');
  if (scoreCampaign.ownerType !== ownerType) throw new Error('Mismatching owner type');

  const config = scoreCampaign[action as 'add' | 'subtract'];
  let placeholder = config.placeholder;
  const attributes = generateAttributes(placeholder);

  for (const attr of attributes) {
    const val = target[attr];
    if (val === undefined) throw new Error(`Attribute "${attr}" not found`);
    placeholder = placeholder.replace(new RegExp(`\\{\\{\\s*${attr}\\s*\\}\\}`, 'g'), val);
  }
  if (placeholder.includes('{{')) throw new Error('Unresolved placeholders in expression');

  const scope: Record<string, number> = {};
  for (const attr of attributes) {
    const num = parseFloat(target[attr]);
    if (isNaN(num)) throw new Error(`Attribute ${attr} is not a number`);
    scope[attr] = num;
  }

  const scoreValue = safeEval(placeholder, scope);
  const scoreToChange = scoreValue / Number(config.currencyRatio);
  await models.ScoreLogs.changeScore({ ownerId, ownerType, changeScore: scoreToChange, description });
  return 'success';
};

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


// Loyalty reward (automations) – extracted common logic
async function triggerLoyaltyReward(subdomain: string, collectionName: string, query: any) {
  const targets = await coreQuery(subdomain, collectionName, 'find', query, []);
  if (targets.length === 0) return;
  await sendTRPCMessage({
    subdomain,
    pluginName: 'automations',
    method: 'mutation',
    module: 'automations',
    action: 'trigger',
    input: { type: 'loyalties:reward', targets },
    defaultValue: [],
  });
}

export const handleLoyaltyReward = async ({ subdomain }) => {
  if (!(await isEnabled('automations'))) return;
  const VERSION = getEnv({ name: 'VERSION' });
  const NOW = new Date();
  const NOW_MONTH = NOW.getMonth() + 1;

  for (const collectionName of Object.keys(collections)) {
    const query = collections[collectionName](NOW_MONTH) || {};
    if (VERSION === 'saas') {
      const orgs = await getSaasOrganizations();
      const enabledOrganizations = orgs.filter((org) => !org?.isDisabled);
      for (const org of enabledOrganizations) {
        await triggerLoyaltyReward(org.subdomain, collectionName, query);
      }
    } else {
      await triggerLoyaltyReward(subdomain, collectionName, query);
    }
  }
};

// Score campaign
export const doScoreCampaign = async (models: IModels, data) => {
  const { ownerType, ownerId, actionMethod, targetId } = data;
  try {
    await models.ScoreCampaigns.checkScoreAviableSubtract(data);
    const scoreLog = await models.ScoreLogs.find({ ownerId, ownerType, targetId, action: actionMethod }).lean();
    if (scoreLog.length) return;
    return await models.ScoreCampaigns.doCampaign(data);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export const refundLoyaltyScore = async (
  models: IModels,
  { targetId, ownerType, ownerId, scoreCampaignIds, checkInId }
) => {
  if (!scoreCampaignIds.length) return;
  const scoreCampaigns = await models.ScoreCampaigns.find({ _id: { $in: scoreCampaignIds } }).lean();
  for (const scoreCampaign of scoreCampaigns) {
    const checkInIds =
      scoreCampaign.additionalConfig?.cardBasedRule?.flatMap(({ refundStageIds }) => refundStageIds) || [];
    if (checkInIds.includes(checkInId)) {
      try {
        await models.ScoreCampaigns.refundLoyaltyScore(targetId, ownerType, ownerId);
      } catch (error) {
        if (error.message === 'Cannot refund loyalty score cause already refunded loyalty score') return;
      }
    }
  }
};