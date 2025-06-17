import { IContext } from '../../../connectionResolver';
import { sendCoreMessage } from '../../../messageBroker';

export default {
  async customer({ customerId, customerPhone }, {}, { subdomain }: IContext) {
    if (!customerId && !customerPhone) {
      return null;
    }
    const customerQuery = customerId
      ? { _id: customerId }
      : { primaryPhone: customerPhone };

    const customer = await sendCoreMessage({
      subdomain,
      action: 'customers.findOne',
      data: customerQuery,
      isRPC: true,
      defaultValue: {},
    });
    return customer;
  },
};
