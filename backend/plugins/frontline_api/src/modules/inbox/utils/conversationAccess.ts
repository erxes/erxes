import { visibleChannelsFilter } from '@/channel/utils';
import type { IContext, IModels } from '~/connectionResolvers';

export type IAuthUser = IContext['user'];

export const authorizeConversationAccess = async (
  models: IModels,
  user: IAuthUser | null | undefined,
  conversationId: string,
  subdomain: string,
): Promise<void> => {
  if (!user) {
    throw new Error('Authentication required');
  }

  if (user.role === 'system') {
    return;
  }

  const conversation = await models.Conversations.getConversation(
    conversationId,
  );
  const integration = await models.Integrations.findOne({
    _id: conversation.integrationId,
    isActive: { $ne: false },
  }).lean();

  const visibleChannels = await visibleChannelsFilter({
    models,
    subdomain,
    user,
  });
  if (
    !integration?.channelId ||
    !(await models.Channels.exists({
      $and: [{ _id: integration.channelId }, visibleChannels],
    }))
  ) {
    throw new Error('You do not have permission to access this conversation');
  }
};
