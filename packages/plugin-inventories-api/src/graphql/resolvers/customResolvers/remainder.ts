import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';

export default {
  async category(remainder: any, _, { subdomain }: IContext) {
    return sendProductsMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: remainder.categoryId
      },
      isRPC: true
    });
  }
};
