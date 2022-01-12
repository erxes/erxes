import { Integrations } from '../../models';
import { IChannelDocument } from '../../models/definitions/channels';
import { getDocumentList } from '../../cacheUtils';

export default {
  integrations(channel: IChannelDocument) {
    return Integrations.findIntegrations({
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