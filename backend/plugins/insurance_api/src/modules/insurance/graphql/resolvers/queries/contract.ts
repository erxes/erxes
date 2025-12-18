import { IContext } from '~/connectionResolvers';

export const contractQueries = {
  contracts: async (_parent: undefined, { vendorId, customerId }: { vendorId?: string; customerId?: string }, { models }: IContext) => {
    const query: any = {};
    if (vendorId) query.vendor = vendorId;
    if (customerId) query.customer = customerId;
    return models.Contract.find(query).populate('vendor').populate('customer').populate('insuranceType').populate('insuranceProduct');
  },

  contract: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Contract.findById(id).populate('vendor').populate('customer').populate('insuranceType').populate('insuranceProduct');
  },
};