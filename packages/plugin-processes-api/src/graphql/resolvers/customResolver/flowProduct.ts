import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { IFlow } from '../../../models/definitions/flows';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.FlowCategories.findOne({ _id });
  },

  async product(flow: IFlow, {}, { subdomain }: IContext) {
    return (
      (await sendProductsMessage({
        subdomain,
        action: 'findOne',
        data: { _id: flow.productId || '' },
        isRPC: true
      })) || undefined
    );
  }
};
