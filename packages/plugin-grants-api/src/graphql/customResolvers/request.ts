import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { IGrantRequest } from '../../models/definitions/grant';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Requests.findOne({ _id });
  },

  async users(
    request: { _id: string } & IGrantRequest,
    {},
    { subdomain, models }: IContext
  ) {
    if (!request?.userIds?.length) {
      return null;
    }

    const responses = await models.Responses.find({
      requestId: request._id,
      userId: request.userIds
    });

    const users = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: request.userIds }
        }
      },
      isRPC: true,
      defaultValue: []
    });

    for (const user of users) {
      const response = responses.find(response => response.userId === user._id);
      if (response) {
        user.grantResponse = response.response;
      } else {
        user.grantResponse = 'waiting';
      }
    }
    return users;
  }
};
