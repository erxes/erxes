import * as strip from 'strip';

import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';

/**
 * Handle requests from erxes api
 */
export const handleInstagramMessage = async (models: IModels, msg) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments } = doc;

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
    });

    const { senderId } = conversation;

    try {
      if (content) {
        try {
          await sendReply(
            models,
            'me/messages',
            {
              recipient: { id: senderId },
              message: { text: content },
              tag: 'HUMAN_AGENT'
            },
            integrationId
          );

          return { status: 'success' };
        } catch (e) {
          throw new Error(e.message);
        }
      }

      for (const message of generateAttachmentMessages(attachments)) {
        try {
          await sendReply(
            models,
            'me/messages',
            { recipient: { id: senderId }, message },
            integrationId
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  }
};
