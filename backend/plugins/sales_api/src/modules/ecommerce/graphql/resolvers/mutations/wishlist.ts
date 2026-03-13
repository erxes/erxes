import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';

export const wishlistMutations: Record<string, Resolver> = {
  wishlistAdd: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId, customerId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId }).lean();
    if (wsh) {
      return wsh;
    }
    const added = await Wishlist.createWishlist({
      productId,
      customerId,
    });
    return added;
  },
  wishlistUpdate: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { _id, productId, customerId } = params;
    const updated = await Wishlist.updateWishlist(_id, {
      productId,
      customerId,
    });
    return updated;
  },
  wishlistRemove: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { _id } = params;
    const removed = await Wishlist.removeWishlist(_id);
    return removed;
  },

  cpWishlistAdd: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId, customerId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId }).lean();
    if (wsh) {
      return wsh;
    }
    const added = await Wishlist.createWishlist({
      productId,
      customerId,
    });
    return added;
  },
  cpWishlistUpdate: async (
    _root,
    params,
    { models: { Wishlist } }: IContext,
  ) => {
    const { _id, productId, customerId } = params;
    const updated = await Wishlist.updateWishlist(_id, {
      productId,
      customerId,
    });
    return updated;
  },
  cpWishlistRemove: async (
    _root,
    params,
    { models: { Wishlist } }: IContext,
  ) => {
    const { _id } = params;
    const removed = await Wishlist.removeWishlist(_id);
    return removed;
  },
};

export default wishlistMutations;

wishlistMutations.cpWishlistAdd.wrapperConfig = {
  forClientPortal: true,
};
wishlistMutations.cpWishlistUpdate.wrapperConfig = {
  forClientPortal: true,
};
wishlistMutations.cpWishlistRemove.wrapperConfig = {
  forClientPortal: true,
};
