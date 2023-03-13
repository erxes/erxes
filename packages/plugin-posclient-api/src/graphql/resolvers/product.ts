import { IContext } from '../../connectionResolver';
import { IProduct } from '../../models/definitions/products';

export default {
  async unitPrice(product: IProduct, _args, { config }: IContext) {
    return (product.prices || {})[config.token] || 0;
  }
};
