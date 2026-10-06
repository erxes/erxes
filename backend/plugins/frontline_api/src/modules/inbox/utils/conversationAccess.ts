import { IModels } from '~/connectionResolvers';

export interface IAuthUser {
  _id: string;
  role?: string;
}

/** Require membership of the active integration owning a conversation. */
export const authorizeConversationAccess = async (
  models: IModels,
  user: IAuthUser | null | undefined,
  conversationId: string,
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
  const memberships = await models.ChannelMembers.find({
    memberId: user._id,
  }).lean();
  const channelIds = memberships.map((membership) => membership.channelId);
  const integration = await models.Integrations.findOne({
    _id: conversation.integrationId,
    isActive: { $ne: false },
    channelId: { $in: channelIds },
  }).lean();

  if (!integration) {
    throw new Error('You do not have permission to access this conversation');
  }
};
