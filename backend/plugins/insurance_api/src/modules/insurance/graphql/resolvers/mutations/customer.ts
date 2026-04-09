import { IContext } from '~/connectionResolvers';

export const customerMutations = {
  createCustomer: Object.assign(
    async (
      _parent: undefined,
      { input }: { input: any },
      { models }: IContext,
    ) => {
      return models.Customer.create(input);
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateCustomer: Object.assign(
    async (
      _parent: undefined,
      { id, input }: { id: string; input: any },
      { models }: IContext,
    ) => {
      return models.Customer.findByIdAndUpdate(id, input, { new: true });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  deleteCustomer: Object.assign(
    async (
      _parent: undefined,
      { id }: { id: string },
      { models }: IContext,
    ) => {
      await models.Customer.findByIdAndDelete(id);
      return true;
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
