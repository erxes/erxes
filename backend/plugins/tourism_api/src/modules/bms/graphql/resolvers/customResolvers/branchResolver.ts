import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const item = {
  async user(branch: any, _args, { models, subdomain }: IContext) {
    const userDetail = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        _id: branch.userId,
      },
      defaultValue: {},
    });
    return userDetail;
  },
};

export default item;
