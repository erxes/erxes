import { IContext } from '~/connectionResolvers';
import { IOrderItemDocument } from '~/modules/posclient/@types/orderItems';

export default {
  async productName(
    orderItem: IOrderItemDocument,
    _args,
    { models }: IContext,
  ) {
    const product = await models.Products.findOne({ _id: orderItem.productId });

    if (!product) {
      return orderItem.productName || 'product not found';
    }

    return `${product.code} - ${product.name}`;
  },
  async productImgUrl(
    orderItem: IOrderItemDocument,
    _args,
    { models }: IContext,
  ) {
    const product = (await models.Products.findOne({
      _id: orderItem.productId,
    })) || {
      attachment: { url: '' },
    };

    return product?.attachment?.url;
  },
};
