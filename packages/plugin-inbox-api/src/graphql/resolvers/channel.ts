import { IChannelDocument } from '../../models/definitions/channels';
import { IContext } from '../../connectionResolver';

export default {
  integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: channel.integrationIds }
    });
  },

  members(channel: IChannelDocument, _args, { coreModels }: IContext) {
    return coreModels.Users.find({
      _id: { $in: channel.memberIds },
      isActive: { $ne: false }
    });
  }
};