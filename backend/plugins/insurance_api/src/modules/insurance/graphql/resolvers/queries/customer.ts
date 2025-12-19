import { IContext } from '~/connectionResolvers';

export const customerQueries = {
  customers: async (_parent: undefined, { vendorId }: { vendorId?: string }, { models, user }: IContext) => {
    // Restrict to own vendor unless admin
    if (vendorId) return models.Customer.find({ vendor: vendorId });
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');
    return models.Customer.find({ vendor: vendorUser.vendor });
  },

  customer: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Customer.findById(id);
  },
};