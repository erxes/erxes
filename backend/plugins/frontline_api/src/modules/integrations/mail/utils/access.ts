import { ExpectedError } from 'erxes-api-shared/utils';
import type { IContext, IModels } from '~/connectionResolvers';
import { visibleChannelsFilter } from '@/channel/utils';

interface IMailConversationAccessParams {
  models: IModels;
  subdomain: string;
  user: IContext['user'];
  conversationId: string;
}

interface IMailDraftAccessParams
  extends Omit<IMailConversationAccessParams, 'conversationId'> {
  draftId: string;
}

export const assertMailConversationAccess = async ({
  models,
  subdomain,
  user,
  conversationId,
}: IMailConversationAccessParams): Promise<void> => {
  if (!user?._id) {
    throw new ExpectedError('Authentication required', 'UNAUTHORIZED');
  }

  const conversation = await models.Conversations.findOne(
    { _id: conversationId },
    { integrationId: 1 },
  ).lean();

  if (!conversation?.integrationId) {
    throw new ExpectedError('Conversation not found', 'NOT_FOUND');
  }

  const integration = await models.Integrations.findOne(
    { _id: conversation.integrationId },
    { channelId: 1 },
  ).lean();

  if (!integration?.channelId) {
    throw new ExpectedError('Conversation integration not found', 'NOT_FOUND');
  }

  const channel = await models.Channels.exists({
    $and: [
      { _id: integration.channelId },
      await visibleChannelsFilter({ models, subdomain, user }),
    ],
  });

  if (!channel) {
    throw new ExpectedError('Forbidden', 'FORBIDDEN');
  }
};

export const assertMailDraftAccess = async ({
  models,
  subdomain,
  user,
  draftId,
}: IMailDraftAccessParams): Promise<void> => {
  const draft = await models.MailDrafts.findOne(
    { _id: draftId },
    { inboxConversationId: 1 },
  ).lean();

  if (!draft) {
    throw new ExpectedError('Draft not found', 'NOT_FOUND');
  }

  await assertMailConversationAccess({
    models,
    subdomain,
    user,
    conversationId: draft.inboxConversationId,
  });
};
