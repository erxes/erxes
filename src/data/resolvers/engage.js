import { Segments, Users, Tags, Brands } from '../../db/models';

export default {
  segment(engageMessage) {
    return Segments.findOne({ _id: engageMessage.segmentId });
  },

  fromUser(engageMessage) {
    return Users.findOne({ _id: engageMessage.fromUserId });
  },

  getTags(engageMessage) {
    return Tags.find({ _id: { $in: engageMessage.tagIds || [] } });
  },
  brand(engageMessage) {
    const { messenger = {} } = engageMessage;

    if (messenger.brandId) {
      return Brands.findOne({ _id: messenger.brandId });
    }
  },
};
