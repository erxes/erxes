import { IContext } from '../../../connectionResolver';
import { models } from '../../../connectionResolver';
const wishlistQueries = {
  wishlist: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId } = params;
    return Wishlist.getWishlist(productId);
  },
  allWishlists: async (_root, params) => {
    const { customerId } = params;
    return models?.Wishlist.getAllWishlist(customerId);
  }
};
//requireLogin(wishlistQueries, '');
export default wishlistQueries;
