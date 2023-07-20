import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { ISafeRemainderItemDocument } from '../../../models/definitions/safeRemainderItems';

export default {
  async product(
    safeRemainderItem: ISafeRemainderItemDocument,
    _,
    { subdomain }: IContext
  ) {
    return sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: {
        _id: safeRemainderItem.productId
      },
      isRPC: true
    });
  }
};
