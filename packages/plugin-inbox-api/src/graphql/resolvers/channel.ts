import { Users } from "../../apiCollections";
import { Integrations } from "../../models";
import { IChannelDocument } from "../../models/definitions/channels";

export default {
  integrations(channel: IChannelDocument) {
    return Integrations.findIntegrations({
      _id: { $in: channel.integrationIds }
    });
  },

  members(channel: IChannelDocument) {
    return Users.find({
      _id: { $in: channel.memberIds },
      isActive: { $ne: false }
    }).toArray();
  }
};
