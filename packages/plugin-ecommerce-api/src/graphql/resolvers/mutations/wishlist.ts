import { IContext } from '../../../connectionResolver';

const wishlistMutations = {
  wishlistAdd: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId, customerId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId }).lean();
    if (wsh) {
      return wsh;
    }
    const added = await Wishlist.createWishlist({
      productId,
      customerId
    });
    return added;
  },
  wishlistUpdate: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { _id, productId, customerId } = params;
    const updated = await Wishlist.updateWishlist(_id, {
      productId,
      customerId
    });
    return updated;
  },
  wishlistRemove: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { _id } = params;
    const removed = await Wishlist.removeWishlist(_id);
    return removed;
  }
};

export default wishlistMutations;
