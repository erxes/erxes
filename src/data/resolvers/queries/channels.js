import { Channels } from '../../../db/models';

export default {
  /**
   * Channels list
   * @param {Object} args
   * @param {Integer} args.limit
   * @param {[String]} args.memberIds
   * @return {Promise} filtered channels list by given parameters
   */
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

  /**
   * Get all channels count. We will use it in pager
   * @return {Promise} total count
   */
  channelsTotalCount() {
    return Channels.find({}).count();
  },
};
