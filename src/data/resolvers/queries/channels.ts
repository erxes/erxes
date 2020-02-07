import { Channels } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';

interface IIn {
  $in: string[];
}

interface IChannelQuery {
  memberIds?: IIn;
}

const channelQueries = {
  /**
   * Channels list
   */
  channels(_root, { memberIds }: { memberIds: string[] }) {
    const query: IChannelQuery = {};
    const sort = { createdAt: -1 };

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }

    return Channels.find(query).sort(sort);
  },

  /**
   * Get one channel
   */
  channelDetail(_root, { _id }: { _id: string }) {
    return Channels.findOne({ _id });
  },

  /**
   * Get all channels count. We will use it in pager
   */
  channelsTotalCount() {
    return Channels.find({}).countDocuments();
  },

  /**
   * Get last channel
   */
  channelsGetLast() {
    return Channels.findOne({}).sort({ createdAt: -1 });
  },
};

requireLogin(channelQueries, 'channelsGetLast');
requireLogin(channelQueries, 'channelsTotalCount');
requireLogin(channelQueries, 'channelDetail');

checkPermission(channelQueries, 'channels', 'showChannels', []);

export default channelQueries;
