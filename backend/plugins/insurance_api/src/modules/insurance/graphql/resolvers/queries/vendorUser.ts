import { IContext } from '~/connectionResolvers';

export const vendorUserQueries = {
  vendorUsers: async (
    _parent: undefined,
    { vendorId }: { vendorId?: string },
    { models }: IContext,
  ) => {
    const filter = vendorId ? { vendor: vendorId } : {};
    return models.VendorUser.find(filter).populate('vendor');
  },

  vendorUser: async (
    _parent: undefined,
    { id }: { id: string },
    { models }: IContext,
  ) => {
    return models.VendorUser.findById(id).populate('vendor');
  },

  currentVendorUser: Object.assign(
    async (
      _parent: undefined,
      _args: any,
      { insuranceVendorUser, models }: IContext,
    ) => {
      if (!insuranceVendorUser) {
        return null;
      }

      return models.VendorUser.findById(insuranceVendorUser._id).populate(
        'vendor',
      );
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
