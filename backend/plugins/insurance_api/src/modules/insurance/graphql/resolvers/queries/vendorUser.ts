import { IContext } from '~/connectionResolvers';
import mongoose from 'mongoose';

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
    async (_parent: undefined, _args: any, { user, models }: IContext) => {
      if (!user) {
        return null;
      }
      // JWT token-аас userId авах (user._id, user.userId, эсвэл user.id байж болно)
      const userId = (user as any).userId || user._id || user.id;
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return null;
      }
      return models.VendorUser.findById(userId).populate('vendor');
    },
    { wrapperConfig: { skipPermission: true } },
  ),
};
