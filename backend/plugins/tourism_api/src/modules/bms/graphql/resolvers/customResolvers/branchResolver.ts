import { IContext } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IBranch } from '~/modules/bms/@types/branch';

const item = {
  async user(branch: IBranch, _args, { models, subdomain }: IContext) {
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
  async managers(branch: IBranch, _args, { models, subdomain }: IContext) {
    const managerIds = branch.managerIds || [];

    if (!managerIds.length) {
      return [];
    }

    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: {
        query: { _id: { $in: managerIds } },
      },
      defaultValue: [],
    });
    return users;
  },
  async generalManagers(
    branch: IBranch,
    _args,
    { models, subdomain }: IContext,
  ) {
    const generalManagerIds = branch.generalManagerIds || [];

    if (!generalManagerIds.length) {
      return [];
    }

    const users = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'find',
      input: {
        query: { _id: { $in: generalManagerIds } },
      },
      defaultValue: [],
    });
    return users;
  },
};

export default item;
