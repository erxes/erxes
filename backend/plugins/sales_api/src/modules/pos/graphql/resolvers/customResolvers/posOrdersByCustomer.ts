import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const resolver = {
  customerDetail: async ({ _id, customerType }, _, { subdomain }: IContext) => {
    if (customerType === 'user') {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id },
      });
    }

    if (customerType === 'company') {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { _id },
      });
    }

    if (!!_id && !customerType) {
      return await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { _id },
      });
    }
    return null;
  },
};

export default resolver;
