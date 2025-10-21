import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export default {
  async customer({ customerPhone }, _params, { subdomain }: IContext) {
    if (!customerPhone) {
      return null;
    }

    // Fetch the user who sent the reply
    const customer = await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        $or: [{ primaryPhone: customerPhone }, { phones: customerPhone }],
      },
    });

    return customer;
  },
};
