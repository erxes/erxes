import { Channels } from '../../../db/models';

export default {
  channels(root, { limit }) {
    const channels = Channels.find({});

    if (limit) {
      return channels.limit(limit);
    }

    return channels;
  },

  totalChannelsCount() {
    return Channels.find({}).count();
  },
};
