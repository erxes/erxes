import { IContext } from '../../../connectionResolver';

const wishlistQueries = {
  wishlist: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId } = params;
    return Wishlist.getAllWishlist(productId);
  }
};
//requireLogin(wishlistQueries, '');
export default wishlistQueries;
