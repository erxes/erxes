import { Channels } from '../../../db/models';

export default {
  channels(root, { limit, memberIds }) {
    const query = {};

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }

    const channels = Channels.find(query);

    if (limit) {
      return channels.limit(limit);
    }

    return channels;
  },

  totalChannelsCount() {
    return Channels.find({}).count();
  },
};
