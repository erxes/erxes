import { IContext } from '~/connectionResolvers';

export const customerMutations = {
  createCustomer: async (
    _parent: undefined,
    { input }: { input: any },
    { models }: IContext,
  ) => {
    return models.Customer.create(input);
  },

  updateCustomer: async (
    _parent: undefined,
    { id, input }: { id: string; input: any },
    { models }: IContext,
  ) => {
    return models.Customer.findByIdAndUpdate(id, input, { new: true });
  },

  deleteCustomer: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    await models.Customer.findByIdAndDelete(id);
    return true;
  },
};
