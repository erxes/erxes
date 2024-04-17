import { IContext } from '../../../connectionResolver';
import { sendContactsMessage } from '../../../messageBroker';

export default {
  async customer({ customerPhone }, {}, { subdomain }: IContext) {
    if (!customerPhone) {
      return null;
    }
    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { primaryPhone: customerPhone },
      isRPC: true,
      defaultValue: {},
    });
    return customer;
  },
};
