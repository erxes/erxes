import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  async customer({ customerPhone }, {}, { subdomain }: IContext) {
    if (!customerPhone) {
      return null;
    }
    const customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: { primaryPhone: customerPhone },
      isRPC: true,
      defaultValue: {},
    });
    return customer;
  },
};
