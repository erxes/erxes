import { IChannelDocument } from '../../db/models/definitions/channels';
import { getDocumentList } from './mutations/cacheUtils';

export default {
  integrations(channel: IChannelDocument) {
    return getDocumentList('integrations', {
      _id: { $in: channel.integrationIds },
      isActive: { $ne: false }
    });
  },

  members(channel: IChannelDocument) {
    return getDocumentList('users', {
      _id: { $in: channel.memberIds },
      isActive: { $ne: false }
    });
  }
};
