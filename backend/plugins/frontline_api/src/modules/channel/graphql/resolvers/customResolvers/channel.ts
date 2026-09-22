import { IContext, IModels } from '~/connectionResolvers';
import { IChannelDocument } from '@/channel/@types/channel';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';

// Conversations belong to an integration, and an integration belongs to a
// channel, so every conversation count for a channel starts from its
// integration ids.
const integrationIdsOf = (models: IModels, channelId: string) =>
  models.Integrations.distinct('_id', { channelId });

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

  // The navigation only needs existence; avoid counting every matching ticket.
  hasTickets: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return Boolean(
      await models.Ticket.exists({
        channelId: channel._id,
        state: { $ne: 'deleted' },
      }),
    );
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

  integrationCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    return models.Integrations.countDocuments({ channelId: channel._id });
  },

  integrationKinds: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    const integrations = await models.Integrations.find(
      { channelId: channel._id },
      { kind: 1 },
    ).lean();
    return (integrations as Array<{ kind?: string }>)
      .map((i) => i.kind)
      .filter(Boolean);
  },

  conversationCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models }: IContext,
  ) => {
    const integrationIds = await integrationIdsOf(models, channel._id);

    if (!integrationIds.length) {
      return 0;
    }

    return models.Conversations.countDocuments({
      integrationId: { $in: integrationIds },
    });
  },

  /*
   * Conversations still waiting on the caller: open, and not yet marked read by
   * them. This is per-viewer, so it is deliberately not derived from
   * `conversationCount`.
   */
  unreadConversationCount: async (
    channel: IChannelDocument,
    _params: undefined,
    { models, user }: IContext,
  ) => {
    if (!user?._id) {
      return 0;
    }

    const integrationIds = await integrationIdsOf(models, channel._id);

    if (!integrationIds.length) {
      return 0;
    }

    return models.Conversations.countDocuments({
      integrationId: { $in: integrationIds },
      status: {
        $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN],
      },
      readUserIds: { $ne: user._id },
    });
  },
};
