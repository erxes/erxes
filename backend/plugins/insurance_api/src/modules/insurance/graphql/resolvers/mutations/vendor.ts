import { IContext } from '~/connectionResolvers';

export const vendorMutations = {
  addProductToVendor: async (_parent: undefined, { vendorId, productId, pricingOverride }: { vendorId: string; productId: string; pricingOverride?: any }, { models }: IContext) => {
    return models.Vendor.findByIdAndUpdate(vendorId, {
      $push: { offeredProducts: { product: productId, pricingOverride } }
    }, { new: true });
  },

  removeProductFromVendor: async (_parent: undefined, { vendorId, productId }: { vendorId: string; productId: string }, { models }: IContext) => {
    return models.Vendor.findByIdAndUpdate(vendorId, {
      $pull: { offeredProducts: { product: productId } }
    }, { new: true });
  },

  createVendorUser: async (_parent: undefined, { username, password, vendorId, role }: { username: string; password: string; vendorId: string; role?: string }, { models }: IContext) => {
    return models.VendorUser.create({ username, password, vendor: vendorId, role });
  },
};