import { IModels } from '~/connectionResolvers';

type MergeMutationName = 'customersMerge' | 'companiesMerge' | 'productsMerge';

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
  'companiesMerge',
  'productsMerge',
];

const updateOrderCustomer = async (
  models: IModels,
  oldIds: string[],
  newId: string,
  customerType: 'customer' | 'company',
) => {
  await models.Orders.updateMany(
    {
      customerId: { $in: oldIds },
      customerType:
        customerType === 'customer'
          ? { $in: ['customer', '', null] }
          : customerType,
    },
    { $set: { customerId: newId } },
  );
};

const updateProductVendor = async (
  models: IModels,
  oldCompanyIds: string[],
  newCompanyId: string,
) => {
  await models.Products.updateMany(
    { vendorId: { $in: oldCompanyIds } },
    { $set: { vendorId: newCompanyId } },
  );
};

const updateOrderItemsProduct = async (
  models: IModels,
  oldProductIds: string[],
  newProductId: string,
) => {
  await models.OrderItems.updateMany(
    { productId: { $in: oldProductIds } },
    { $set: { productId: newProductId } },
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
      await updateOrderCustomer(models, customerIds, newId, 'customer');
    }
  }

  if (mutationName === 'companiesMerge') {
    const companyIds = data.args?.companyIds || [];

    if (companyIds.length) {
      await updateOrderCustomer(models, companyIds, newId, 'company');
      await updateProductVendor(models, companyIds, newId);
    }
  }

  if (mutationName === 'productsMerge') {
    const productIds = data.args?.productIds || [];

    if (productIds.length) {
      await updateOrderItemsProduct(models, productIds, newId);
    }
  }
};
