import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const Ticket = {
  async status({ statusId }, _params, { models }: IContext) {
    if (!statusId) {
      return null;
    }
    return await models.Status.findOne({ _id: statusId });
  },
  async assignees(
    { assigneeIds }: { assigneeIds?: string[] },
    _params,
    { subdomain }: IContext,
  ) {
    if (!assigneeIds?.length) {
      return [];
    }

    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      method: 'query',
      action: 'find',
      input: { query: { _id: { $in: assigneeIds } } },
      defaultValue: [],
    });
  },

  async isSubscribed({ subscribedUserIds }, _params, { user }: IContext) {
    if (!subscribedUserIds || subscribedUserIds.length === 0) {
      return false;
    }

    return subscribedUserIds.includes(user?._id);
  },
};
