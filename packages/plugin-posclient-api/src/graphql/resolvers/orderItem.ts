import { IContext } from '../../connectionResolver';
import { IOrderItemDocument } from '../../models/definitions/orderItems';

export default {
  async productName(
    orderItem: IOrderItemDocument,
    _args,
    { models }: IContext
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
    { models }: IContext
  ) {
    const product = (await models.Products.findOne({
      _id: orderItem.productId
    })) || {
      attachment: { url: '' }
    };

    return product.attachment && product.attachment.url;
  }
};
