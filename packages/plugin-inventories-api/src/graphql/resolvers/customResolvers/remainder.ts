import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  async category(remainder: any, _, { subdomain }: IContext) {
    return sendCoreMessage({
      subdomain,
      action: 'categories.findOne',
      data: {
        _id: remainder.categoryId
      },
      isRPC: true
    });
  }
};
