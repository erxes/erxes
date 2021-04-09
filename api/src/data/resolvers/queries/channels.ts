import { Channels } from '../../../db/models';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { getDocumentList } from '../mutations/cacheUtils';

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
  channelsByMembers(_root, { memberIds }: { memberIds: string[] }) {
    return getDocumentList('channels', { memberIds: { $in: memberIds } });
  },

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
    return Channels.getChannel(_id);
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
  }
};

requireLogin(channelQueries, 'channelsGetLast');
requireLogin(channelQueries, 'channelsTotalCount');
requireLogin(channelQueries, 'channelDetail');

checkPermission(channelQueries, 'channels', 'showChannels', []);

export default channelQueries;
