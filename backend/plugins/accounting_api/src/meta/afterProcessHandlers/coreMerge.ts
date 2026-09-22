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

const updateCustomerReferences = async (
  models: IModels,
  oldIds: string[],
  newId: string,
  customerType: 'customer' | 'company',
) => {
  await models.Transactions.updateMany(
    {
      customerId: { $in: oldIds },
      $or: [
        { customerType },
        ...(customerType === 'customer'
          ? [{ customerType: { $exists: false } }, { customerType: '' }]
          : []),
      ],
    },
    { $set: { customerId: newId } },
  );
};

const updateProductReferences = async (
  models: IModels,
  oldIds: string[],
  newId: string,
) => {
  await models.Transactions.updateMany(
    { 'details.productId': { $in: oldIds } },
    { $set: { 'details.$[detail].productId': newId } },
    { arrayFilters: [{ 'detail.productId': { $in: oldIds } }] },
  );

  await models.Transactions.updateMany(
    { 'shortDetail.productId': { $in: oldIds } },
    { $set: { 'shortDetail.productId': newId } },
  );

  await Promise.all([
    models.AdjustInvDetails.updateMany(
      { productId: { $in: oldIds } },
      { $set: { productId: newId } },
    ),
    models.ReserveRems.updateMany(
      { productId: { $in: oldIds } },
      { $set: { productId: newId } },
    ),
    models.SafeRemainderItems.updateMany(
      { productId: { $in: oldIds } },
      { $set: { productId: newId } },
    ),
  ]);
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
    await updateCustomerReferences(
      models,
      mergeIds.oldIds,
      mergeIds.newId,
      'customer',
    );
    return;
  }

  if (mergeIds.type === 'company') {
    await updateCustomerReferences(
      models,
      mergeIds.oldIds,
      mergeIds.newId,
      'company',
    );
    return;
  }

  await updateProductReferences(models, mergeIds.oldIds, mergeIds.newId);
};
