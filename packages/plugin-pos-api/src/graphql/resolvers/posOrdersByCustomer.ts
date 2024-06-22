import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendContactsMessage, sendCoreMessage } from '../../messageBroker';

const resolver = {
  customerDetail: async ({ _id, customerType }, {}, { subdomain }) => {
    if (customerType === 'user') {
      return await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id },
        isRPC: true,
        defaultValue: null,
      });
    }

    if (customerType === 'company' && isEnabled('contacts')) {
      return await sendContactsMessage({
        subdomain,
        action: 'companies.findOne',
        data: { _id },
        isRPC: true,
        defaultValue: null,
      });
    }

    if (!!_id && !customerType) {
      return await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { _id },
        isRPC: true,
        defaultValue: null,
      });
    }
    return null;
  },
};

export default resolver;
