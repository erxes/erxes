import {
  getEnv,
  getSaasOrganizations,
  isEnabled,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import {
  absDependencies,
  addDependencies,
  ceilDependencies,
  create,
  divideDependencies,
  floorDependencies,
  multiplyDependencies,
  powDependencies,
  roundDependencies,
  sqrtDependencies,
  subtractDependencies,
} from 'mathjs';
import { IModels } from '~/connectionResolvers';
import {
  SCORE_ACTION,
  SCORE_CAMPAIGN_STATUSES,
} from '~/modules/score/constants';
import { fixScoreNumber } from '~/modules/score/services/scoreLedger';
import { VOUCHER_STATUS } from '~/modules/voucher/constants';
import { collections } from '../constants';

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
      field: { _id: 1 }
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

const availableVoucherTypes = ['bonus', 'discount'];

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
  const {
    categoryIds = [],
    excludeCategoryIds = [],
    productIds = [],
    excludeProductIds = [],
    tagIds = [],
    excludeTagIds = [],
  } = restrictions || {};

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

// Voucher helpers
async function processVoucherBonus(
  voucher: any,
  productsIds: string[],
  result: any,
) {
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
  result: any,
) {
  const { title, kind, value, restrictions } = voucher.campaign;
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
      voucherCampaignId: voucher.campaignId,
      voucherId: voucher._id,
      discount,
      voucherName: title,
      type: 'discount',
      sumDiscount: (result[productId]?.sumDiscount || 0) + discount,
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
) {
  let source;
  if (sourceType === 'voucher') {
    source = await models.Vouchers.checkVoucher({
      voucherId: sourceId,
      ownerType,
      ownerId,
    });
    await models.Vouchers.checkVoucher({
      voucherId: sourceId,
      ownerType,
      ownerId,
      totalAmount,
    });
  } else {
    source = await models.Coupons.checkCoupon({ code: sourceId, ownerId });
    await models.Coupons.checkCoupon({ code: sourceId, ownerId, totalAmount });
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
  discountInfo?: Record<string, string>,
) => {
  const result = {};
  const { couponCode, voucherId } = discountInfo || {};

  if (!ownerId && !products) {
    return 'No Data';
  }

  if (ownerType === 'customer') {
    const customerRelatedClientPortalUserById = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
      input: { id: ownerId },
      defaultValue: null,
    });
    const customerRelatedClientPortalUser =
      customerRelatedClientPortalUserById ||
      (await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'cpUsers',
        action: 'get',
        input: { erxesCustomerId: ownerId },
        defaultValue: null,
      }));

    if (customerRelatedClientPortalUser) {
      ownerId = customerRelatedClientPortalUser._id;
      ownerType = 'cpUser';
    }
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
    subdomain,
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
    targetId?: string;
    targetType?: string;
    serviceName?: string;
    totalAmount?: string | number;
    [key: string]: any;
  },
) => {
  const { couponCode, voucherId, totalAmount, ...usageInfo } = extraInfo || {};

  if (extraInfo?.ownerType === 'customer' && extraInfo?.ownerId) {
    const customerRelatedClientPortalUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'cpUsers',
      action: 'get',
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

    const voucher = await models.Vouchers.findOne({
      _id: rule.voucherId,
    }).lean();
    if (!voucher) continue;

    const campaign = await models.VoucherCampaigns.findOne({
      _id: voucher.campaignId,
    });
    if (!campaign) continue;

    const oldBonusCount = (voucher.bonusInfo || []).reduce(
      (sum, i) => sum + i.usedCount,
      0,
    );
    const updateInfo: any = { $push: { bonusInfo: { usedCount: rule.count } } };
    if (campaign.bonusCount - oldBonusCount <= rule.count) {
      updateInfo.$set = { status: VOUCHER_STATUS.LOSS };
    }
    await models.Vouchers.updateOne({ _id: rule.voucherId }, updateInfo);
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

// Attribute extraction (safe manual parsing)
export const generateAttributes = (value: string) => {
  const MAX_LENGTH = 5000;
  if (!value || value.length > MAX_LENGTH) return [];

  const attributes: string[] = [];
  let i = 0;
  const len = value.length;
  while (i < len) {
    const openIndex = value.indexOf('{{', i);
    if (openIndex === -1) break;
    const closeIndex = value.indexOf('}}', openIndex + 2);
    if (closeIndex === -1) break;
    const content = value.substring(openIndex + 2, closeIndex).trim();
    if (content) attributes.push(content);
    i = closeIndex + 2;
  }
  return attributes;
};

// Safe arithmetic evaluator (secure math instance)
const limitedMath = create(
  {
    add: addDependencies,
    subtract: subtractDependencies,
    multiply: multiplyDependencies,
    divide: divideDependencies,
    pow: powDependencies,
    sqrt: sqrtDependencies,
    abs: absDependencies,
    round: roundDependencies,
    floor: floorDependencies,
    ceil: ceilDependencies,
  },
  {
    number: 'number',
    precision: 64,
  },
);

function safeEval(expression: string, scope: Record<string, number>): number {
  try {
    const compiled = limitedMath.compile(expression);
    const result = compiled.evaluate(scope);
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
  const {
    action,
    ownerId,
    ownerType,
    campaignId,
    target,
    description,
    createdBy,
    serviceName,
    targetId,
  } = data;
  const scoreCampaign = await models.ScoreCampaigns.findOne({
    _id: campaignId,
  });
  if (!scoreCampaign) throw new Error('Not found');
  if (scoreCampaign.ownerType !== ownerType)
    throw new Error('Mismatching owner type');

  const config = (scoreCampaign as any)[action as 'add' | 'subtract' | 'set'];
  if (!config) {
    throw new Error('Score campaign action config not found');
  }
  let placeholder = config.placeholder;
  const attributes = generateAttributes(placeholder);

  for (const attr of attributes) {
    const val = target[attr];
    if (val === undefined) throw new Error(`Attribute "${attr}" not found`);
    placeholder = placeholder.replace(
      new RegExp(`\\{\\{\\s*${attr}\\s*\\}\\}`, 'g'),
      val,
    );
  }
  if (placeholder.includes('{{'))
    throw new Error('Unresolved placeholders in expression');

  const scope: Record<string, number> = {};
  for (const attr of attributes) {
    const num = parseFloat(target[attr]);
    if (isNaN(num)) throw new Error(`Attribute ${attr} is not a number`);
    scope[attr] = num;
  }

  const scoreValue = safeEval(placeholder, scope);
  const scoreToChange = fixScoreNumber(
    scoreValue / Number(config.currencyRatio),
  );

  let changeScore = Math.abs(scoreToChange);
  if (action === SCORE_ACTION.SET) changeScore = scoreToChange;
  if (action === SCORE_ACTION.SUBTRACT) changeScore = -Math.abs(scoreToChange);

  await models.ScoreLogs.changeScore({
    ownerId,
    ownerType,
    changeScore,
    description,
    createdBy,
    campaignId,
    action,
    targetId,
    serviceName,
  });

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

// Loyalty reward (automations)
async function triggerLoyaltyReward(
  subdomain: string,
  collectionName: string,
  query: any,
) {
  const targets = await coreQuery(subdomain, collectionName, 'find', query, []);
  if (targets.length === 0) return;
  await sendTRPCMessage({
    subdomain,
    pluginName: 'automations',
    method: 'mutation',
    module: 'automations',
    action: 'trigger',
    input: { type: 'loyalty:reward', targets },
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
  try {
    return await models.ScoreCampaigns.doCampaign(data);
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

const generateTargetTotalAmount = (productsData: any[] = []) =>
  productsData.reduce((sum, product) => sum + (product?.amount || 0), 0);

const getPaymentScoreCampaignId = (paymentType: any) =>
  paymentType?.scoreCampaignId;

const normalizeDealTarget = ({
  target,
  paymentTypes = [],
}: {
  target: any;
  paymentTypes?: any[];
}) => {
  const scorePaymentTypes = new Set(
    paymentTypes
      .filter((paymentType) => !!getPaymentScoreCampaignId(paymentType))
      .map(({ type }) => type),
  );
  const paymentEntries = Object.entries(target?.paymentsData || {});

  return {
    ...target,
    paymentsData: paymentEntries.map(([type, obj]) => ({
      type,
      ...(obj ?? {}),
    })),
    totalAmount: generateTargetTotalAmount(target?.productsData || []),
    excludeAmount: paymentEntries
      .filter(([type]) => !scorePaymentTypes.has(type))
      .map(([type, obj]) => ({
        type,
        ...(obj ?? {}),
      }))
      .reduce((sum, payment: any) => sum + (payment?.amount || 0), 0),
  };
};

const normalizePosOrderTarget = ({ target }: { target: any }) => {
  const paymentEntries = (target?.paidAmounts || []).map((payment: any) => [
    payment.type,
    payment,
  ]);

  return {
    ...target,
    productsData: target?.items || [],
    paymentsData: paymentEntries.map(([type, obj]) => ({
      type,
      ...(obj ?? {}),
    })),
    totalAmount:
      Number(target?.totalAmount) ||
      Number(target?.finalAmount) ||
      generateTargetTotalAmount(target?.items || []),
    excludeAmount: paymentEntries.reduce(
      (sum, [, payment]: any) => sum + (payment?.amount || 0),
      0,
    ),
  };
};

const getPosOrderStageContext = (target?: any) => {
  if (!target) {
    return {};
  }

  if (target.status === 'return') {
    return { stage: { _id: 'lossStage' } };
  }

  if (target.status === 'complete') {
    return { stage: { _id: 'wonStage' } };
  }

  return { stage: { _id: 'preStage' } };
};

const getStageCampaigns = async ({
  models,
  contexts,
}: {
  models: IModels;
  contexts: Array<{ stage?: any; pipeline?: any }>;
}) => {
  const $or = contexts
    .filter(({ stage }) => stage?._id)
    .map(({ stage, pipeline }) => {
      const elemMatch: any = {
        $or: [{ stageIds: stage._id }, { refundStageIds: stage._id }],
      };

      if (pipeline?._id) {
        elemMatch.pipelineId = pipeline._id;
      }

      if (pipeline?.boardId) {
        elemMatch.boardId = pipeline.boardId;
      }

      return {
        'additionalConfig.cardBasedRule': {
          $elemMatch: elemMatch,
        },
      };
    });

  if (!$or.length) {
    return [];
  }

  return models.ScoreCampaigns.find({
    status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
    $or,
  })
    .sort({ order: 1, createdAt: 1 })
    .lean();
};

const getOwnerIdByCampaign = ({
  campaign,
  ownerHints = {},
  target,
}: {
  campaign: any;
  ownerHints?: Record<string, string>;
  target: any;
}) => {
  const ownerType = campaign.ownerType || 'customer';

  return {
    ownerType,
    ownerId:
      ownerHints[ownerType] ||
      (ownerType === 'user' ? target?.userId : undefined),
  };
};

const getStageCampaignActionMethod = (
  campaign: any,
): 'add' | 'subtract' | 'set' => {
  if (campaign?.set?.placeholder?.trim()) {
    return 'set';
  }

  if (campaign?.add?.placeholder?.trim()) {
    return 'add';
  }

  return 'add';
};

const uniqBy = (items: any[], key: (item: any) => string) =>
  Array.from(new Map(items.map((item) => [key(item), item])).values());

const consumeSalesDealScoreChange = async ({
  models,
  subdomain,
  input,
}: {
  models: IModels;
  subdomain: string;
  input: any;
}) => {
  const {
    target,
    oldTarget,
    targetId,
    ownerHints = {},
    stageContexts = {},
  } = input;

  if (!target?._id && !targetId) {
    return [];
  }

  const oldContext = stageContexts.old || {};
  const newContext = stageContexts.current || {};

  const currentPaymentTypes = newContext?.pipeline?.paymentTypes || [];
  const allPaymentTypes = uniqBy(
    [
      ...(oldContext?.pipeline?.paymentTypes || []),
      ...currentPaymentTypes,
    ].filter((paymentType) => !!getPaymentScoreCampaignId(paymentType)),
    (paymentType) =>
      `${paymentType.type}:${getPaymentScoreCampaignId(paymentType)}`,
  );

  const calculationTarget = normalizeDealTarget({
    target,
    paymentTypes: currentPaymentTypes,
  });
  const results: any[] = [];
  const currentPaymentTypeNames = Object.keys(target?.paymentsData || {});
  const oldPaymentTypeNames = Object.keys(oldTarget?.paymentsData || {});
  const changedPaymentTypeNames = new Set([
    ...currentPaymentTypeNames,
    ...oldPaymentTypeNames,
  ]);

  if (ownerHints.customer) {
    for (const paymentType of allPaymentTypes) {
      if (!changedPaymentTypeNames.has(paymentType.type)) {
        continue;
      }

      const paymentData = calculationTarget.paymentsData.find(
        (payment) => payment.type === paymentType.type,
      );

      results.push(
        await models.ScoreCampaigns.doCampaign({
          ownerType: 'customer',
          ownerId: ownerHints.customer,
          campaignId: getPaymentScoreCampaignId(paymentType),
          target: {
            ...calculationTarget,
            paymentData,
            paymentAmount: Number(paymentData?.amount) || 0,
          },
          oldTarget,
          actionMethod: 'subtract',
          serviceName: input.serviceName || 'sales',
          targetId: targetId || target._id,
        }),
      );
    }
  }

  const stageCampaigns = await getStageCampaigns({
    models,
    contexts: [oldContext, newContext],
  });

  for (const campaign of stageCampaigns) {
    const { ownerType, ownerId } = getOwnerIdByCampaign({
      campaign,
      ownerHints,
      target,
    });

    if (!ownerId) {
      continue;
    }

    results.push(
      await models.ScoreCampaigns.doCampaign({
        ownerType,
        ownerId,
        campaignId: campaign._id,
        target: calculationTarget,
        oldTarget,
        actionMethod: getStageCampaignActionMethod(campaign),
        serviceName: input.serviceName || 'sales',
        targetId: targetId || target._id,
      }),
    );
  }

  return results.filter(Boolean);
};

const consumePosOrderScoreChange = async ({
  models,
  input,
}: {
  models: IModels;
  input: any;
}) => {
  const { target, oldTarget, targetId, ownerHints = {} } = input;

  if (!target?._id && !targetId) {
    return [];
  }

  const oldContext = getPosOrderStageContext(oldTarget);
  const newContext = getPosOrderStageContext(target);
  const calculationTarget = normalizePosOrderTarget({ target });
  const stageCampaigns = await getStageCampaigns({
    models,
    contexts: [oldContext, newContext],
  });
  const results: any[] = [];

  for (const campaign of stageCampaigns) {
    const { ownerType, ownerId } = getOwnerIdByCampaign({
      campaign,
      ownerHints,
      target,
    });

    if (!ownerId) {
      continue;
    }

    results.push(
      await models.ScoreCampaigns.doCampaign({
        ownerType,
        ownerId,
        campaignId: campaign._id,
        target: calculationTarget,
        oldTarget,
        actionMethod: getStageCampaignActionMethod(campaign),
        serviceName: input.serviceName || 'sales',
        targetId: targetId || target._id,
      }),
    );
  }

  return results.filter(Boolean);
};

export const consumeScoreTargetChange = async ({
  models,
  subdomain,
  input,
}: {
  models: IModels;
  subdomain: string;
  input: any;
}) => {
  if (input?.contentType === 'sales:deal') {
    return consumeSalesDealScoreChange({ models, subdomain, input });
  }

  if (input?.contentType === 'sales:posOrder') {
    return consumePosOrderScoreChange({ models, input });
  }

  throw new Error(
    `Unsupported score target content type: ${input?.contentType}`,
  );
};

export const refundLoyaltyScore = async (
  models: IModels,
  { targetId, ownerType, ownerId, scoreCampaignIds, checkInId },
) => {
  if (!scoreCampaignIds.length) return;
  const scoreCampaigns = await models.ScoreCampaigns.find({
    _id: { $in: scoreCampaignIds },
  }).lean();
  for (const scoreCampaign of scoreCampaigns) {
    const checkInIds =
      scoreCampaign.additionalConfig?.cardBasedRule?.flatMap(
        ({ refundStageIds }) => refundStageIds,
      ) || [];
    if (checkInIds.includes(checkInId)) {
      try {
        await models.ScoreCampaigns.refundLoyaltyScore(
          targetId,
          ownerType,
          ownerId,
        );
      } catch (error) {
        if (
          error.message ===
          'Cannot refund loyalty score cause already refunded loyalty score'
        )
          return;
      }
    }
  }
};

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
