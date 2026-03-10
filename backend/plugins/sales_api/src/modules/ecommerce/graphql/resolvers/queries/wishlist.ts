import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { Resolver } from 'erxes-api-shared/core-types';

export const wishlistQueries: Record<string, Resolver> = {
  wish: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext,
  ) => {
    const { customerId, productId } = params;
    const wsh = await Wishlist.findOne({ customerId, productId }).lean();

    if (!wsh) return null;

    const product = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'findOne',
      input: { _id: productId },
    });

    if (!product) return null;

    return { ...wsh, product };
  },

  wishlist: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext,
  ) => {
    const { customerId } = params;
    const wishes = await Wishlist.find({ customerId }).lean();

    const productIds = wishes.map((w) => w.productId);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
      },
    });

    const productsById: Record<string, any> = {};

    for (const product of products || []) {
      productsById[product._id] = product;
    }

    const productIdsSet = new Set(Object.keys(productsById));

    return wishes
      .filter((i) => productIdsSet.has(i.productId))
      .map((i) => ({ ...i, product: productsById[i.productId] }));
  },

  cpWishlist: async (
    _root,
    params,
    { models: { Wishlist }, subdomain }: IContext,
  ) => {
    const { customerId } = params;
    const wishes = await Wishlist.find({ customerId }).lean();

    const productIds = wishes.map((w) => w.productId);

    const products = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'products',
      action: 'find',
      input: {
        query: { _id: { $in: productIds } },
      },
    });

    const productsById: Record<string, any> = {};

    for (const product of products || []) {
      productsById[product._id] = product;
    }

    const productIdsSet = new Set(Object.keys(productsById));

    return wishes
      .filter((i) => productIdsSet.has(i.productId))
      .map((i) => ({ ...i, product: productsById[i.productId] }));
  },
};

export default wishlistQueries;

wishlistQueries.cpWishlist.wrapperConfig={
  forClientPortal:true,
}
