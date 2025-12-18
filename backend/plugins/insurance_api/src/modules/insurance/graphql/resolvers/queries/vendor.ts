import { IContext } from '~/connectionResolvers';

export const vendorQueries = {
  vendors: async (_parent: undefined, _args: any, { models }: IContext) => {
    return models.Vendor.find({});
  },

  vendor: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Vendor.findById(id);
  },

  myVendor: async (_parent: undefined, _args: any, { models }: IContext) => {
    // TODO: implement based on current user
    return null;
  },
};