import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { ISafeRemItemDocument } from '../../../models/definitions/safeRemainders';

export default {
  async product(safeRemItem: ISafeRemItemDocument, _, { subdomain }: IContext) {
    return sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: safeRemItem.productId
      },
      isRPC: true
    });
  }
};
