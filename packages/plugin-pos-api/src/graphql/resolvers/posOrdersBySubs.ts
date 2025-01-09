import { isEnabled } from '@erxes/api-utils/src/serviceDiscovery';
import { sendCoreMessage } from '../../messageBroker';

const resolver = {
  customer: async ({ customerId, customerType }, {}, { subdomain }) => {
    if (customerType === 'user') {
      return await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: customerId },
        isRPC: true,
        defaultValue: null
      });
    }

    if (customerType === 'company') {
      return await sendCoreMessage({
        subdomain,
        action: 'companies.findOne',
        data: { _id: customerId },
        isRPC: true,
        defaultValue: null
      });
    }

    if (!!customerId && !customerType) {
      return await sendCoreMessage({
        subdomain,
        action: 'customers.findOne',
        data: { _id: customerId },
        isRPC: true,
        defaultValue: null
      });
    }
    return null;
  }
};

export default resolver;
