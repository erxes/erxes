import {
  IAutomationAction,
  IAutomationExecution,
  replaceOutputPlaceholders,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { sendTelegramReply } from '@/integrations/telegram/controller/sendMessage';
import { telegramTextToHtml } from '@/integrations/telegram/utils/content';
import { TTelegramTriggerTarget } from '@/integrations/telegram/meta/automation/types';

/**
 * "Send Telegram Message": replies as the bot in the chat that triggered the
 * run, then mirrors the reply into the inbox flagged fromBot so the inbox
 * shows it as an automated message.
 */
export const actionSendTelegramMessage = async ({
  models,
  subdomain,
  action,
  execution,
}: {
  models: IModels;
  subdomain: string;
  action: IAutomationAction;
  execution: IAutomationExecution;
}) => {
  const resolved = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: (action.config || {}) as Record<string, unknown>,
    defaultValue: '',
  });
  const content =
    typeof resolved.content === 'string' ? resolved.content.trim() : '';

  if (!content) {
    throw new Error('Telegram message action needs message text');
  }

  const target = (execution.target || {}) as Partial<TTelegramTriggerTarget>;

  if (!target.integrationId || !target.conversationId) {
    throw new Error(
      'Send Telegram Message works only after a Telegram message trigger',
    );
  }

  const { data } = await sendTelegramReply({
    models,
    subdomain,
    payload: {
      integrationId: target.integrationId,
      conversationId: target.conversationId,
      content,
      fromBot: true,
    },
  });

  // Telegram already accepted the reply; a failed inbox mirror must not turn
  // a delivered message into a failed step.
  await receiveInboxMessage(subdomain, {
    action: 'create-conversation-message',
    metaInfo: 'replaceContent',
    payload: JSON.stringify({
      conversationId: target.conversationId,
      content: telegramTextToHtml(data.content),
      createdAt: new Date(),
      extraData: data.extraData,
      fromBot: true,
    }),
  }).catch(() => undefined);

  return {
    result: {
      messageIds: data.extraData.telegram.messageIds,
      content: data.content,
      conversationId: target.conversationId,
    },
  };
};
