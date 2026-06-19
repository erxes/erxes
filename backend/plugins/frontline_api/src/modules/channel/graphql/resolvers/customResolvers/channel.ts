import { IContext } from '~/connectionResolvers';
import { IChannelDocument } from '@/channel/@types/channel';

export const Channel = {
  memberCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.ChannelMembers.countDocuments({ channelId: channel._id });
  },

  pipelineCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.Pipeline.countDocuments({ channelId: channel._id });
  },

  responseTemplateCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.ResponseTemplates.countDocuments({ channelId: channel._id });
  },

  formCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.Forms.countDocuments({ channelId: channel._id });
  },

  async integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.find({
      channelId: channel._id,
    });
  },
};
