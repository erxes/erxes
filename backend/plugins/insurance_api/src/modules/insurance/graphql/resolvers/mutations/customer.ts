import { IContext } from '~/connectionResolvers';

export const customerMutations = {
  createCustomer: async (_parent: undefined, { name, type, details }: { name: string; type: string; details: any }, { models }: IContext) => {
    return models.Customer.create({ ...details, name, type });
  },

  updateCustomer: async (_parent: undefined, { id, name, details }: { id: string; name?: string; details?: any }, { models }: IContext) => {
    return models.Customer.findByIdAndUpdate(id, { ...details, name }, { new: true });
  },
};