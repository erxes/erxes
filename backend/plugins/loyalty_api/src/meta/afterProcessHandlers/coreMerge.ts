import { OWNER_TYPES } from '~/constants';
import { IModels } from '~/connectionResolvers';

export const mergeMutationNames = [
  'customersMerge',
  'companiesMerge',
  'productsMerge',
] as const;

type MergeMutationName = (typeof mergeMutationNames)[number];

type MergeMutationData = {
  mutationName?: string;
  args?: {
    customerIds?: string[];
    companyIds?: string[];
    productIds?: string[];
  };
  result?: {
    _id?: string;
  };
};

type OwnerMerge = {
  ownerType: string;
  oldOwnerIds: string[];
  newOwnerId: string;
};

type ProductMerge = {
  oldProductIds: string[];
  newProductId: string;
};

type ArrayReference = {
  model: keyof Pick<
    IModels,
    'Agents' | 'PricingPlans' | 'VoucherCampaigns'
  >;
  path: string;
};

const ownerReferenceModels: Array<
  keyof Pick<
    IModels,
    | 'Assignments'
    | 'Donates'
    | 'Lotteries'
    | 'ScoreCampaigns'
    | 'ScoreLogs'
    | 'Spins'
    | 'Vouchers'
  >
> = [
  'Assignments',
  'Donates',
  'Lotteries',
  'ScoreCampaigns',
  'ScoreLogs',
  'Spins',
  'Vouchers',
];

const productArrayReferences: ArrayReference[] = [
  { model: 'PricingPlans', path: 'products' },
  { model: 'PricingPlans', path: 'productsExcluded' },
  { model: 'VoucherCampaigns', path: 'productIds' },
];

// Single-product references nested inside PricingPlans rule subdocuments.
const pricingRuleProductPaths = ['priceRules', 'quantityRules', 'expiryRules'];

const isMergeMutationName = (
  mutationName?: string,
): mutationName is MergeMutationName =>
  Boolean(
    mutationName &&
      (mergeMutationNames as readonly string[]).includes(mutationName),
  );

const getMergeIds = (data: MergeMutationData) => {
  const newId = data.result?._id;

  if (!newId || !isMergeMutationName(data.mutationName)) {
    return null;
  }

  if (data.mutationName === 'customersMerge') {
    return {
      type: 'customer' as const,
      oldIds: data.args?.customerIds || [],
      newId,
    };
  }

  if (data.mutationName === 'companiesMerge') {
    return {
      type: 'company' as const,
      oldIds: data.args?.companyIds || [],
      newId,
    };
  }

  return {
    type: 'product' as const,
    oldIds: data.args?.productIds || [],
    newId,
  };
};

const replaceArrayReferences = async (
  models: IModels,
  { model, path }: ArrayReference,
  oldIds: string[],
  newId: string,
) => {
  await models[model].updateMany(
    { [path]: { $in: oldIds } },
    { $addToSet: { [path]: newId } },
  );

  await models[model].updateMany(
    { [path]: { $in: oldIds } },
    { $pull: { [path]: { $in: oldIds } } },
  );
};

// Coupon owner references live only inside the `usageLogs` subdocument array,
// not on the top-level document.
const updateCouponUsageLogOwner = async (
  models: IModels,
  { ownerType, oldOwnerIds, newOwnerId }: OwnerMerge,
) => {
  await models.Coupons.updateMany(
    { usageLogs: { $elemMatch: { ownerType, ownerId: { $in: oldOwnerIds } } } },
    { $set: { 'usageLogs.$[log].ownerId': newOwnerId } },
    {
      arrayFilters: [
        { 'log.ownerType': ownerType, 'log.ownerId': { $in: oldOwnerIds } },
      ],
    },
  );
};

const updateOwnerReferences = async (
  models: IModels,
  { ownerType, oldOwnerIds, newOwnerId }: OwnerMerge,
) => {
  await Promise.all(
    ownerReferenceModels.map((model) =>
      models[model].updateMany(
        { ownerType, ownerId: { $in: oldOwnerIds } },
        { $set: { ownerId: newOwnerId } },
      ),
    ),
  );

  await updateCouponUsageLogOwner(models, {
    ownerType,
    oldOwnerIds,
    newOwnerId,
  });

  if (ownerType === OWNER_TYPES.CUSTOMER) {
    await replaceArrayReferences(
      models,
      { model: 'Agents', path: 'customerIds' },
      oldOwnerIds,
      newOwnerId,
    );
  }

  if (ownerType === OWNER_TYPES.COMPANY) {
    await replaceArrayReferences(
      models,
      { model: 'Agents', path: 'companyIds' },
      oldOwnerIds,
      newOwnerId,
    );

    await replaceArrayReferences(
      models,
      { model: 'PricingPlans', path: 'vendors' },
      oldOwnerIds,
      newOwnerId,
    );
  }

  await models.ScoreLogs.repairOwnerScore({ ownerType, ownerId: newOwnerId });
};

// `productsBundle` is a nested array of arrays of product ids, which cannot be
// remapped with a single positional update, so it is rewritten in memory.
const updatePricingPlanBundles = async (
  models: IModels,
  oldProductIds: string[],
  newProductId: string,
) => {
  const oldIdSet = new Set(oldProductIds);

  const plans = await models.PricingPlans.find({
    'productsBundle.0': { $exists: true },
  }).lean();

  for (const plan of plans) {
    const bundle: string[][] = (plan.productsBundle as string[][]) || [];
    let changed = false;

    const newBundle = bundle.map((group) => {
      const mapped = (group || []).map((productId) => {
        if (oldIdSet.has(productId)) {
          changed = true;
          return newProductId;
        }
        return productId;
      });

      return Array.from(new Set(mapped));
    });

    if (changed) {
      await models.PricingPlans.updateOne(
        { _id: plan._id },
        { $set: { productsBundle: newBundle } },
      );
    }
  }
};

const updateProductReferences = async (
  models: IModels,
  { oldProductIds, newProductId }: ProductMerge,
) => {
  for (const reference of productArrayReferences) {
    await replaceArrayReferences(models, reference, oldProductIds, newProductId);
  }

  await models.PricingPlans.updateMany(
    { bonusProduct: { $in: oldProductIds } },
    { $set: { bonusProduct: newProductId } },
  );

  await models.VoucherCampaigns.updateMany(
    { bonusProductId: { $in: oldProductIds } },
    { $set: { bonusProductId: newProductId } },
  );

  for (const rulePath of pricingRuleProductPaths) {
    await models.PricingPlans.updateMany(
      { [`${rulePath}.discountBonusProduct`]: { $in: oldProductIds } },
      { $set: { [`${rulePath}.$[rule].discountBonusProduct`]: newProductId } },
      { arrayFilters: [{ 'rule.discountBonusProduct': { $in: oldProductIds } }] },
    );
  }

  await updatePricingPlanBundles(models, oldProductIds, newProductId);
};

export const handleCoreMergeMutation = async (
  models: IModels,
  data?: MergeMutationData,
) => {
  const mergeIds = getMergeIds(data || {});

  if (!mergeIds || mergeIds.oldIds.length === 0) {
    return;
  }

  if (mergeIds.type === 'customer') {
    await updateOwnerReferences(models, {
      ownerType: OWNER_TYPES.CUSTOMER,
      oldOwnerIds: mergeIds.oldIds,
      newOwnerId: mergeIds.newId,
    });
    return;
  }

  if (mergeIds.type === 'company') {
    await updateOwnerReferences(models, {
      ownerType: OWNER_TYPES.COMPANY,
      oldOwnerIds: mergeIds.oldIds,
      newOwnerId: mergeIds.newId,
    });
    return;
  }

  await updateProductReferences(models, {
    oldProductIds: mergeIds.oldIds,
    newProductId: mergeIds.newId,
  });
};
