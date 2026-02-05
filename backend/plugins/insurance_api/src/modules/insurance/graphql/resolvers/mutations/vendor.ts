import { IContext } from '~/connectionResolvers';

export const vendorMutations = {
  createVendor: async (
    _parent: undefined,
    { name }: { name: string },
    { models }: IContext,
  ) => {
    return models.Vendor.create({ name, offeredProducts: [] });
  },

  updateVendor: async (
    _parent: undefined,
    { id, name }: { id: string; name: string },
    { models }: IContext,
  ) => {
    return models.Vendor.findByIdAndUpdate(
      id,
      { name },
      { new: true },
    ).populate({
      path: 'offeredProducts.product',
      populate: [{ path: 'insuranceType' }, { path: 'coveredRisks.risk' }],
    });
  },

  addProductToVendor: async (
    _parent: undefined,
    {
      vendorId,
      productId,
      pricingOverride,
    }: {
      vendorId: string;
      productId: string;
      pricingOverride?: any;
    },
    { models }: IContext,
  ) => {
    const vendor = await models.Vendor.findByIdAndUpdate(
      vendorId,
      {
        $push: {
          offeredProducts: { product: productId, pricingOverride },
        },
      },
      { new: true },
    ).populate({
      path: 'offeredProducts.product',
      populate: [{ path: 'insuranceType' }, { path: 'coveredRisks.risk' }],
    });

    if (!vendor) return null;

    return {
      ...vendor.toObject(),
      offeredProducts: vendor.offeredProducts.filter(
        (vp: any) => vp.product != null,
      ),
    };
  },

  removeProductFromVendor: async (
    _parent: undefined,
    { vendorId, productId }: { vendorId: string; productId: string },
    { models }: IContext,
  ) => {
    const vendor = await models.Vendor.findByIdAndUpdate(
      vendorId,
      {
        $pull: { offeredProducts: { product: productId } },
      },
      { new: true },
    ).populate({
      path: 'offeredProducts.product',
      populate: [{ path: 'insuranceType' }, { path: 'coveredRisks.risk' }],
    });

    if (!vendor) return null;

    return {
      ...vendor.toObject(),
      offeredProducts: vendor.offeredProducts.filter(
        (vp: any) => vp.product != null,
      ),
    };
  },

  createVendorUser: async (
    _parent: undefined,
    {
      username,
      password,
      vendorId,
      role,
    }: { username: string; password: string; vendorId: string; role?: string },
    { models }: IContext,
  ) => {
    return models.VendorUser.create({
      username,
      password,
      vendor: vendorId,
      role,
    });
  },
};
