import { Segments, Users } from '../../db/models';

export default {
  segment(engageMessage) {
    return Segments.findOne({ _id: engageMessage.segmentId });
  },

  fromUser(engageMessage) {
    return Users.findOne({ _id: engageMessage.fromUserId });
  },
};
