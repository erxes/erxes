import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const Ticket = {
  async activityLog(
    { _id }: { _id: string },
    _params: undefined,
    { models }: IContext,
  ) {
    return models.Activity.find({ contentId: _id }).sort({ createdAt: 1 });
  },
  async status({ statusId }, _params, { models }: IContext) {
    if (!statusId) {
      return null;
    }
    return await models.Status.findOne({ _id: statusId });
  },
  async assignee(
    { assigneeId }: { assigneeId: string },
    _params,
    { subdomain }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'users',
      method: 'query',
      action: 'findOne',
      input: { query: { _id: assigneeId } },
    });
  },

  async isSubscribed({ subscribedUserIds }, _params, { user }: IContext) {
    if (!subscribedUserIds || subscribedUserIds.length === 0) {
      return false;
    }

    return subscribedUserIds.includes(user?._id);
  },
};
