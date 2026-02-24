import { IContext } from '~/connectionResolvers';

export const vendorQueries = {
  vendors: async (_parent: undefined, _args: any, { models }: IContext) => {
    const vendors = await models.Vendor.find({}).populate({
      path: 'offeredProducts.product',
      populate: [{ path: 'insuranceType' }, { path: 'coveredRisks.risk' }],
    });

    return vendors.map((vendor: any) => ({
      ...vendor.toObject(),
      offeredProducts: vendor.offeredProducts.filter(
        (vp: any) => vp.product != null,
      ),
    }));
  },

  vendor: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    const vendor = await models.Vendor.findById(id).populate({
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

  myVendor: async (
    _parent: undefined,
    _args: any,
    { models, insuranceVendorUser }: IContext,
  ) => {
    if (!insuranceVendorUser) throw new Error('Must be logged in');
    const vendorUser = await models.VendorUser.findById(
      insuranceVendorUser._id,
    );
    if (!vendorUser) throw new Error('Vendor user not found');
    const vendor = await models.Vendor.findById(vendorUser.vendor).populate({
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
};
