import { Integrations, Users } from '../../db/models';
import { IChannelDocument } from '../../db/models/definitions/channels';

export default {
  integrations(channel: IChannelDocument) {
    return Integrations.findIntegrations({ _id: { $in: channel.integrationIds } });
  },

  members(channel: IChannelDocument) {
    const selector = {
      _id: 1,
      email: 1,
      'details.avatar': 1,
      'details.fullName': 1,
    };

    return Users.find({ _id: { $in: channel.memberIds }, isActive: { $ne: false } }).select(selector);
  },
};
