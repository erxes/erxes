import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { IFlow } from '../../../models/definitions/flows';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Flows.findOne({ _id });
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
  },

  async jobCount(flow: IFlow, {}, {}: IContext) {
    return (flow.jobs || []).length;
  }
};
