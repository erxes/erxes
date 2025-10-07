import { IContext } from '~/connectionResolvers';
import { IChannelFilter } from '~/modules/channel/@types/channel';

export const channelQueries = {
  getChannel: async (_parent: undefined, { _id }, { models }: IContext) => {
    return models.Channels.getChannel(_id);
  },

  getMyChannels: async (
    _parent: undefined,
    _params: undefined,
    { models, user }: IContext,
  ) => {
    if (!user?._id) throw new Error('Unauthorized');
    const userId = user._id;
    const channelIds = await models.ChannelMembers.find({
      memberId: userId,
    }).distinct('channelId');

    return models.Channels.find({ _id: { $in: channelIds } });
  },

  getChannels: async (
    _parent: undefined,
    params: IChannelFilter,
    { models, user }: IContext,
  ) => {
    if (params.channelIds && params.channelIds.length > 0) {
      return models.Channels.find({ _id: { $in: params.channelIds } });
    }

    if (params.integrationId) {
      const channelIds = await models.Integrations.distinct('channelId', {
        _id: params.integrationId,
      });
      return models.Channels.find({ _id: { $in: channelIds } });
    }

    const userId = params.userId || user._id;
    if (userId) {
      const channelIds = await models.ChannelMembers.find({
        memberId: userId,
      }).distinct('channelId');
      return models.Channels.find({ _id: { $in: channelIds } });
    }

    return [];
  },

  getChannelMembers: async (
    _parent: undefined,
    { channelId, channelIds }: { channelId: string; channelIds: string[] },
    { models }: IContext,
  ) => {
    if (channelIds && channelIds.length > 0) {
      return models.ChannelMembers.aggregate([
        {
          $match: {
            channelId: { $in: channelIds },
          },
        },
        {
          $sort: { _id: -1 },
        },
        {
          $group: {
            _id: '$memberId',
            doc: { $first: '$$ROOT' },
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' },
        },
      ]);
    }
    return await models.ChannelMembers.find({ channelId });
  },
};
