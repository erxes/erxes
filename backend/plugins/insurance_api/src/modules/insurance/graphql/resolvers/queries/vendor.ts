import { IContext } from '~/connectionResolvers';

export const vendorQueries = {
  vendors: async (_parent: undefined, _args: any, { models }: IContext) => {
    return models.Vendor.find({});
  },

  vendor: async (_parent: undefined, { id }: { id: string }, { models }: IContext) => {
    return models.Vendor.findById(id).populate({
      path: 'offeredProducts.product',
      populate: { path: 'insuranceType' },
    });
  },

  myVendor: async (_parent: undefined, _args: any, { models, user }: IContext) => {
    if (!user) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(user.id);
    if (!vendorUser) throw new Error('Vendor user not found');
    return models.Vendor.findById(vendorUser.vendor);
  },
};