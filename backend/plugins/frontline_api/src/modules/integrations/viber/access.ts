import type { IContext } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';

export const assertViberIntegrationAccess = async (
  context: IContext,
  integrationId: string,
  permission:
    | 'showConversations'
    | 'conversationMessageAdd'
    | 'integrationsEdit'
    | 'showIntegrations',
) => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission(permission);
  const integration = await context.models.Integrations.findOne({
    _id: integrationId,
  });
  if (!integration || integration.kind.split('-')[0] !== 'viber')
    throw new Error('Viber integration not found');
  const visible = await visibleChannelsFilter(context);
  if (
    !(await context.models.Channels.exists({
      $and: [{ _id: integration.channelId }, visible],
    }))
  ) {
    throw new Error('Viber channel access denied');
  }
  return integration;
};

export const assertViberConversationAccess = async (
  context: IContext,
  conversationId: string,
  permission: 'showConversations' | 'conversationMessageAdd',
) => {
  if (!context.user?._id) throw new Error('Authentication required');
  // Do not disclose conversation existence to an unauthenticated caller.
  await context.checkPermission(permission);
  const conversation = await context.models.Conversations.findOne({
    _id: conversationId,
  });
  if (!conversation?.integrationId)
    throw new Error('Viber conversation not found');
  const integration = await assertViberIntegrationAccess(
    context,
    conversation.integrationId,
    permission,
  );
  return { conversation, integration };
};
