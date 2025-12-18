import { IContext } from '~/connectionResolvers';

export const customerQueries = {
  customers: async (_parent: undefined, { vendorId }: { vendorId?: string }, { models }: IContext) => {
    const query = vendorId ? { vendorId } : {};
    return models.Customer.find(query);
  },

  customer: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Customer.findById(id);
  },
};