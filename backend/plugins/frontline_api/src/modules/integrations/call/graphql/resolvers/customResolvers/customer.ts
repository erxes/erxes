import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const CallHistory = {
  async customer(
    { customerPhone }: { customerPhone?: string },
    _params: unknown,
    { subdomain }: IContext,
  ) {
    if (!customerPhone) {
      return null;
    }

    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { customerPrimaryPhone: customerPhone } },
      defaultValue: null,
    });
  },
};
