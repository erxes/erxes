import { Brands, Segments, Tags, Users } from '../../db/models';
import { IEngageMessageDocument } from '../../db/models/definitions/engages';

export default {
  segment(engageMessage: IEngageMessageDocument) {
    return Segments.findOne({ _id: engageMessage.segmentId });
  },

  fromUser(engageMessage: IEngageMessageDocument) {
    return Users.findOne({ _id: engageMessage.fromUserId });
  },

  getTags(engageMessage: IEngageMessageDocument) {
    return Tags.find({ _id: { $in: engageMessage.tagIds || [] } });
  },
  brand(engageMessage: IEngageMessageDocument) {
    const { messenger } = engageMessage;

    if (messenger && messenger.brandId) {
      return Brands.findOne({ _id: messenger.brandId });
    }
  },
};
