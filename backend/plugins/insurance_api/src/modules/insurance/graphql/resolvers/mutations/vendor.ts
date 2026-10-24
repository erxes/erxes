import type { IDiscountTier } from '@/insurance/@types/vendor';
import type { IContext } from '~/connectionResolvers';

export const vendorMutations = {
  createVendor: Object.assign(
    async (
      _parent: undefined,
      { name }: { name: string },
      { models }: IContext,
    ) => {
      return models.Vendor.create({ name, offeredProducts: [] });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  updateVendor: Object.assign(
    async (
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
        populate: [
          { path: 'insuranceType' },
          { path: 'coveredRisks.risk' },
          { path: 'regions' },
        ],
      });
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  addProductToVendor: Object.assign(
    async (
      _parent: undefined,
      {
        vendorId,
        productId,
        pricingOverride,
        discountTiers,
      }: {
        vendorId: string;
        productId: string;
        pricingOverride?: unknown;
        discountTiers?: IDiscountTier[] | null;
      },
      { models }: IContext,
    ) => {
      const vendor = await models.Vendor.findByIdAndUpdate(
        vendorId,
        {
          $push: {
            offeredProducts: {
              product: productId,
              pricingOverride,
              discountTiers: discountTiers || [],
            },
          },
        },
        { new: true },
      ).populate({
        path: 'offeredProducts.product',
        populate: [
          { path: 'insuranceType' },
          { path: 'coveredRisks.risk' },
          { path: 'regions' },
        ],
      });

      if (!vendor) return null;

      return {
        ...vendor.toObject(),
        offeredProducts: vendor.offeredProducts.filter(
          (vp) => vp.product != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),

  removeProductFromVendor: Object.assign(
    async (
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
        populate: [
          { path: 'insuranceType' },
          { path: 'coveredRisks.risk' },
          { path: 'regions' },
        ],
      });

      if (!vendor) return null;

      return {
        ...vendor.toObject(),
        offeredProducts: vendor.offeredProducts.filter(
          (vp) => vp.product != null,
        ),
      };
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
