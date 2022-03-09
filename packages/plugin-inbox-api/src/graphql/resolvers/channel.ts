import { IChannelDocument } from '../../models/definitions/channels';
import { getDocumentList } from '../../cacheUtils';
import { IContext } from '../../connectionResolver';

export default {
  integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: channel.integrationIds }
    });
  },

  members(channel: IChannelDocument) {
    return getDocumentList('users', {
      _id: { $in: channel.memberIds },
      isActive: { $ne: false }
    });
  }
};
