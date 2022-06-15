import { IOrderItemDocument } from '../../models/definitions/orderItems';
import { Products } from '../../models/Products';

export default {
  async productName(orderItem: IOrderItemDocument) {
    const product = await Products.findOne({ _id: orderItem.productId });

    return product ? product.name : 'product not found';
  },
  async productImgUrl(orderItem: IOrderItemDocument) {
    const product = (await Products.findOne({ _id: orderItem.productId })) || {
      attachment: { url: '' }
    };

    return product.attachment && product.attachment.url;
  }
};
