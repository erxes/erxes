import { IContext } from '../../../connectionResolver';
import { models } from '../../../connectionResolver';
const wishlistQueries = {
  wishlist: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId } = params;
    return Wishlist.getWishlist(productId);
  },
  allWishlists: async () => {
    return models?.Wishlist.getAllWishlist();
  }
};
//requireLogin(wishlistQueries, '');
export default wishlistQueries;
