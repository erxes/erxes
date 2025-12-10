import { IContext } from "~/connectionResolvers";
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const wishlistQueries = {
  wish: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext
  ) => {
    const { customerId, productId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId }).lean();

    if (!wsh) return null;

    const product = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'findOne',
      input: { _id: productId }
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

    const products = await sendTRPCMessage({
      subdomain,
      pluginName:'core',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds }}
      }
    //   action: "products.find",
    //   data: {
    //     query: { _id: { $in: productIds } }
    //   },
    //   isRPC: true
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
