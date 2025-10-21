import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const resolver = {
  customer: async (
    { customerId, customerType },
    _,
    { subdomain }: IContext,
  ) => {
    if (customerType === 'user') {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: customerId },
      });
    }

    if (customerType === 'company') {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { _id: customerId },
      });
    }

    if (!!customerId && !customerType) {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { _id: customerId },
      });
    }
    return null;
  },
};

export default resolver;
