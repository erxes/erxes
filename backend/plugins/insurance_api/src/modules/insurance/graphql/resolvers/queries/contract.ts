import { IContext } from '~/connectionResolvers';

export const contractQueries = {
  contracts: async (_parent: undefined, { vendorId, customerId }: { vendorId?: string; customerId?: string }, { models }: IContext) => {
    const query: any = {};
    if (vendorId) query.vendor = vendorId;
    if (customerId) query.customer = customerId;
    // Add vendor restriction in production
    return models.Contract.find(query)
      .populate('vendor customer insuranceType insuranceProduct coveredRisks.risk');
  },

  contract: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Contract.findById(id)
      .populate('vendor customer insuranceType insuranceProduct coveredRisks.risk');
  },

  vendorContracts: async (_parent: undefined, _args: any, { models, user }: IContext) => {
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');
    return models.Contract.find({ vendor: vendorUser.vendor })
      .populate('vendor customer insuranceType insuranceProduct coveredRisks.risk');
  },

  vendorContract: async (_parent: undefined, { id }: { id: string }, { models, user }: IContext) => {
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');
    return models.Contract.findOne({ _id: id, vendor: vendorUser.vendor })
      .populate('vendor customer insuranceType insuranceProduct coveredRisks.risk');
  },
};