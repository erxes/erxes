import { IModels } from '~/connectionResolvers';

type MergeMutationName = 'customersMerge' | 'companiesMerge';

interface IMergeMutationPayload {
  mutationName?: string;
  args?: {
    customerIds?: string[];
    companyIds?: string[];
  };
  result?: {
    _id?: string;
  };
}

export const mergeMutationNames: MergeMutationName[] = [
  'customersMerge',
  'companiesMerge',
];

const updateInvoiceCustomer = async (
  models: IModels,
  oldIds: string[],
  newId: string,
  customerType: 'customer' | 'company',
) => {
  await models.Invoices.updateMany(
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
      await updateInvoiceCustomer(models, customerIds, newId, 'customer');
    }
  }

  if (mutationName === 'companiesMerge') {
    const companyIds = data.args?.companyIds || [];

    if (companyIds.length) {
      await updateInvoiceCustomer(models, companyIds, newId, 'company');
    }
  }
};
