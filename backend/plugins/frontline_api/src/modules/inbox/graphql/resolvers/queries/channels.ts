import { IContext } from '~/connectionResolvers';

interface IIn {
  $in: string[];
}

interface IChannelQuery {
  memberIds?: IIn;
}

export const channelQueries = {
  /**
   * Channels list
   */
  async channelsByMembers(
    _root,
    { memberIds }: { memberIds: string[] },
    { models }: IContext,
  ) {
    return models.Channels.find({ memberIds: { $in: memberIds } });
  },

  /**
   * Channels list
   */
  async channels(
    _root,
    { memberIds }: { memberIds: string[] },
    { models }: IContext,
  ) {
    const query: IChannelQuery = {};
    const sort: any = { createdAt: -1 };

    if (memberIds) {
      query.memberIds = { $in: memberIds };
    }
    const data = await models.Channels.find(query).sort(sort);

    return data;
  },

  /**
   * Get one channel
   */
  async channelDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return await models.Channels.getChannel(_id);
  },

  /**
   * Get all channels count. We will use it in pager
   */
  async channelsTotalCount(_root, _params, { models }: IContext) {
    return models.Channels.countDocuments({});
  },

  /**
   * Get last channel
   */
  async channelsGetLast(_root, _params, { models }: IContext) {
    return models.Channels.findOne({}).sort({ createdAt: -1 });
  },
};
