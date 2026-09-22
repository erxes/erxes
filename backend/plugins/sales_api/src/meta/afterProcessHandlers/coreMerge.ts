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

type ArrayReference = {
  model: keyof Pick<IModels, 'Stages'>;
  path: string;
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

const updateCustomerReferences = async (
  models: IModels,
  oldIds: string[],
  newId: string,
) => {
  await Promise.all([
    models.PosOrders.updateMany(
      {
        customerId: { $in: oldIds },
        $or: [
          { customerType: 'customer' },
          { customerType: { $exists: false } },
          { customerType: '' },
        ],
      },
      { $set: { customerId: newId } },
    ),
    models.ProductReview.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.Wishlist.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.LastViewedItem.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
    models.Address.updateMany(
      { customerId: { $in: oldIds } },
      { $set: { customerId: newId } },
    ),
  ]);

  await replaceArrayReferences(
    models,
    { model: 'Stages', path: 'customerIds' },
    oldIds,
    newId,
  );
};

const updateCompanyReferences = async (
  models: IModels,
  oldIds: string[],
  newId: string,
) => {
  await models.PosOrders.updateMany(
    { customerType: 'company', customerId: { $in: oldIds } },
    { $set: { customerId: newId } },
  );

  await replaceArrayReferences(
    models,
    { model: 'Stages', path: 'companyIds' },
    oldIds,
    newId,
  );
};

const updateProductReferences = async (
  models: IModels,
  oldIds: string[],
  newId: string,
) => {
  await Promise.all([
    models.Deals.updateMany(
      { 'productsData.productId': { $in: oldIds } },
      { $set: { 'productsData.$[product].productId': newId } },
      { arrayFilters: [{ 'product.productId': { $in: oldIds } }] },
    ),
    models.PosOrders.updateMany(
      { 'items.productId': { $in: oldIds } },
      { $set: { 'items.$[item].productId': newId } },
      { arrayFilters: [{ 'item.productId': { $in: oldIds } }] },
    ),
    models.ProductReview.updateMany(
      { productId: { $in: oldIds } },
      { $set: { productId: newId } },
    ),
    models.Wishlist.updateMany(
      { productId: { $in: oldIds } },
      { $set: { productId: newId } },
    ),
    models.LastViewedItem.updateMany(
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
    await updateCustomerReferences(models, mergeIds.oldIds, mergeIds.newId);
    return;
  }

  if (mergeIds.type === 'company') {
    await updateCompanyReferences(models, mergeIds.oldIds, mergeIds.newId);
    return;
  }

  await updateProductReferences(models, mergeIds.oldIds, mergeIds.newId);
};
