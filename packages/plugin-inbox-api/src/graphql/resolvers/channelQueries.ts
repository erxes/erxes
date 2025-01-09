import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

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
  async channelsByMembers(_root, { memberIds }: { memberIds: string[] }, { models }: IContext) {
    return models.Channels.find({ memberIds: { $in: memberIds } });
  },

  /**
   * Channels list
   */
  async channels(_root, { memberIds }: { memberIds: string[] }, { models }: IContext) {
    const query: IChannelQuery = {};
    const sort: any = { createdAt: -1 };

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }

    return models.Channels.find(query).sort(sort);
  },

  /**
   * Get one channel
   */
  async channelDetail(_root, { _id }: { _id: string }, { models }: IContext ) {
    return models.Channels.findOne({ _id });
  },

  /**
   * Get all channels count. We will use it in pager
   */
  async channelsTotalCount(_root, _params, { models }: IContext) {
    return models.Channels.find({}).countDocuments();
  },

  /**
   * Get last channel
   */
  async channelsGetLast(_root, _params, { models }: IContext) {
    return models.Channels.findOne({}).sort({ createdAt: -1 });
  }
};

requireLogin(channelQueries, 'channelsGetLast');
requireLogin(channelQueries, 'channelsTotalCount');
requireLogin(channelQueries, 'channelDetail');

checkPermission(channelQueries, 'channels', 'showChannels', []);

export default channelQueries;