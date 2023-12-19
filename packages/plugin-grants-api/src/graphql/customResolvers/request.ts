import { IContext, models } from '../../connectionResolver';
import { sendCommonMessage, sendCoreMessage } from '../../messageBroker';
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
  },

  async requester({ requesterId }: IGrantRequest, {}, { subdomain }: IContext) {
    return await sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: {
        _id: { $in: requesterId }
      },
      isRPC: true,
      defaultValue: null
    });
  },

  async detail(
    { contentType, contentTypeId, scope }: IGrantRequest,
    {},
    { subdomain }: IContext
  ) {
    const detail = await sendCommonMessage({
      subdomain,
      serviceName: scope,
      action: `${contentType}s.findOne`,
      data: {
        _id: contentTypeId
      },
      isRPC: true,
      defaultValue: null
    });

    return detail ? detail : null;
  },
  async responses(
    { _id }: { _id: string } & IGrantRequest,
    {},
    { models }: IContext
  ) {
    return await models.Responses.find({ requestId: _id });
  },

  async actionLabel({ action }: IGrantRequest, {}, { models }: IContext) {
    const actions = await models.Requests.getGrantActions();
    return (
      actions.find(grantAction => grantAction.action === action)?.label || null
    );
  }
};
