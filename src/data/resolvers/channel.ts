import { Integrations } from '../../db/models';
import { IChannelDocument } from '../../db/models/definitions/channels';

export default {
  integrations(channel: IChannelDocument) {
    return Integrations.find({ _id: { $in: channel.integrationIds } });
  },
};
