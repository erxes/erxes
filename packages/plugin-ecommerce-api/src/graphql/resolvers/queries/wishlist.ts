import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

const wishlistQueries = {
  wish: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext
  ) => {
    const { customerId, productId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId });

    if (!wsh) return null;

    const product = await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        query: { _id: wsh?.productId }
      },
      isRPC: true
    });

    if (!product) return null;

    return { ...wsh, product };
  },

  wishlist: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext
  ) => {
    const { customerId } = params;
    const wishes = await Wishlist.find({ customerId }).lean();

    const productIds = wishes.map(w => w.productId);

    const products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: {
        query: { _id: { $in: productIds } }
      },
      isRPC: true
    });

    const productsById = {};

    for (const product of products) {
      productsById[product._id] = product;
    }

    return wishes
      .filter(i => Object.keys(productsById).includes(i.productId))
      .map(i => ({ ...i, product: productsById[i.productId] }));
  }
};

export default wishlistQueries;
