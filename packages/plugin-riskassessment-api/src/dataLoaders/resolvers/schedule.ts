import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { ISchedule } from '../../models/definitions/plan';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Schedules.findOne({ _id });
  },
  async assignedUsers(
    { assignedUserIds }: ISchedule,
    {},
    { subdomain }: IContext
  ) {
    return await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: { _id: { $in: assignedUserIds } }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};
