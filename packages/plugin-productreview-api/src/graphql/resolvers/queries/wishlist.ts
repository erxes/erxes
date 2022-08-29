import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
const wishlistQueries = {
  wishlist: async (_root, params, { models: { Wishlist } }: IContext) => {
    const { productId } = params;
    return Wishlist.getWishlist(productId);
  },
  allWishlists: async (_root, params, { models, subdomain }: IContext) => {
    const { productId } = params;

    const list = await models.Wishlist.findOne({ productId }).lean();

    const limit = params.perPage || 20;
    const skip = params.page ? (params.page - 1) * limit : 0;
    if (list) {
      return await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: {
            _id: list.productId
          },
          sort: {},
          skip,
          limit
        },
        isRPC: true
      });
    }
  }
};
//requireLogin(wishlistQueries, '');
export default wishlistQueries;
