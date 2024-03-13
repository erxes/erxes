import { IContext } from '../../../connectionResolver';
import { sendContactsMessage } from '../../../messageBroker';

export default {
  async customer({ callerNumber }, {}, { subdomain }: IContext) {
    if (!callerNumber) {
      return null;
    }
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { primaryPhone: callerNumber },
      isRPC: true,
      defaultValue: {},
    });
    return customer;
  },
};
