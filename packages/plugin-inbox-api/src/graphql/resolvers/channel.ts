import { IChannelDocument } from '../../models/definitions/channels';
import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';

export default {
  integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: channel.integrationIds }
    });
  },

  members(channel: IChannelDocument, _args, { subdomain }: IContext) {

    return sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          _id: { $in: channel.memberIds },
          isActive: { $ne: false }
        }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};