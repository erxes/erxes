import { IContext } from '~/connectionResolvers';

export const Ticket = {
  async status({ statusId }, _params, { models }: IContext) {
    if (!statusId) {
      return null;
    }
    return await models.Status.findOne({ _id: statusId });
  },
  async isSubscribed({ subscribedUserIds }, _params, { user }: IContext) {
    if (!subscribedUserIds && subscribedUserIds.lenght === 0) {
      return false;
    }

    return subscribedUserIds.includes(user._id);
  },
};
