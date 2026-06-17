import { IModels } from '~/connectionResolvers';

type MergeMutationName = 'customersMerge' | 'productsMerge';

interface IMergeMutationPayload {
  mutationName?: string;
  args?: {
    customerIds?: string[];
    companyIds?: string[];
    productIds?: string[];
  };
  result?: {
    _id?: string;
  };
}

export const mergeMutationNames: MergeMutationName[] = [
  'customersMerge',
  'productsMerge',
];

const replaceArrayReferences = async (
  models: IModels,
  fieldName: 'productIds' | 'excludeProductIds',
  oldProductIds: string[],
  newProductId: string,
) => {
  await models.ProductRules.updateMany(
    { [fieldName]: { $in: oldProductIds } },
    { $addToSet: { [fieldName]: newProductId } },
  );
  await models.ProductRules.updateMany(
    { [fieldName]: { $in: oldProductIds } },
    { $pull: { [fieldName]: { $in: oldProductIds } } },
  );
};

const replaceProductGroupReferences = async (
  models: IModels,
  oldProductIds: string[],
  newProductId: string,
) => {
  await models.ProductGroups.updateMany(
    { mainProductId: { $in: oldProductIds } },
    { $set: { mainProductId: newProductId } },
  );
  await models.ProductGroups.updateMany(
    { subProductId: { $in: oldProductIds } },
    { $set: { subProductId: newProductId } },
  );
};

const replaceCustomerReferences = async (
  models: IModels,
  oldCustomerIds: string[],
  newCustomerId: string,
) => {
  await models.CustomerRelations.updateMany(
    { customerId: { $in: oldCustomerIds } },
    { $set: { customerId: newCustomerId } },
  );
};

export const handleCoreMergeMutation = async (
  models: IModels,
  data?: IMergeMutationPayload,
) => {
  const mutationName = data?.mutationName;
  const newId = data?.result?._id;

  if (!mutationName || !newId) {
    return;
  }

  if (mutationName === 'customersMerge') {
    const customerIds = data.args?.customerIds || [];

    if (customerIds.length) {
      await replaceCustomerReferences(models, customerIds, newId);
    }
  }

  if (mutationName === 'productsMerge') {
    const productIds = data.args?.productIds || [];

    if (productIds.length) {
      await Promise.all([
        replaceArrayReferences(models, 'productIds', productIds, newId),
        replaceArrayReferences(models, 'excludeProductIds', productIds, newId),
        replaceProductGroupReferences(models, productIds, newId),
      ]);
    }
  }
};
