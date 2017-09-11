import { Channels } from '../../../db/models';

export default {
  channels(root, { limit, memberIds }) {
    const query = {};
    const sort = { createdAt: -1 };

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }

    const channels = Channels.find(query);

    if (limit) {
      return channels.limit(limit).sort(sort);
    }

    return channels.sort(sort);
  },

  totalChannelsCount() {
    return Channels.find({}).count();
  },
};
