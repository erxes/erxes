import { Channels } from '../../../db/models';

export default {
  channels(root, { limit }) {
    return Channels.find({}).limit(limit);
  },

  totalChannelsCount() {
    return Channels.find({}).count();
  },
};
