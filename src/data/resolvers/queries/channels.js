import { Channels } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const channelQueries = {
  /**
   * Channels list
   * @param {Object} args - Search params
   * @return {Promise} filtered channels list by given parameters
   */
  channels(root, { memberIds, ...queryParams }) {
    const query = {};
    const sort = { createdAt: -1 };

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }

    const channels = paginate(Channels.find(query), queryParams);

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

moduleRequireLogin(channelQueries);

export default channelQueries;
