import { IContext } from '~/connectionResolvers';
import { IChannelDocument } from '~/modules/channel/@types/channel';

export const Channel = {
  memberCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.ChannelMembers.countDocuments({ channelId: channel._id });
  },

  async integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.find({
      channelId: channel._id,
    });
  },
};
