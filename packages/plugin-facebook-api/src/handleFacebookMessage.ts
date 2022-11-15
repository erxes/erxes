import { IModels } from './connectionResolver';
import { generateAttachmentMessages, sendReply } from './utils';

/**
 * Handle requests from erxes api
 */
export const handleFacebookMessage = async (models: IModels, msg) => {
  const { action, payload } = msg;
  const doc = JSON.parse(payload || '{}');

  if (action === 'reply-messenger') {
    const { integrationId, conversationId, content, attachments, tag } = doc;

    const conversation = await models.Conversations.getConversation({
      erxesApiId: conversationId
    });

    const { recipientId, senderId } = conversation;
    let localMessage;

    try {
      if (content) {
        try {
          const resp = await sendReply(
            models,
            'me/messages',
            {
              recipient: { id: senderId },
              message: { text: content },
              tag
            },
            recipientId,
            integrationId
          );

          if (resp) {
            localMessage = await models.ConversationMessages.addMessage(
              {
                ...doc,
                // inbox conv id comes, so override
                conversationId: conversation._id,
                mid: resp.message_id
              },
              doc.userId
            );
          }
        } catch (e) {
          await models.ConversationMessages.deleteOne({
            _id: localMessage && localMessage._id
          });

          throw new Error(e.message);
        }
      }

      for (const message of generateAttachmentMessages(attachments)) {
        try {
          await sendReply(
            models,
            'me/messages',
            { recipient: { id: senderId }, message, tag },
            recipientId,
            integrationId
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }
    } catch (e) {
      throw new Error(e.message);
    }

    return {
      status: 'success',
      // inbox conversation id is used for mutation response,
      // therefore override local id
      data: { ...localMessage.toObject(), conversationId }
    };
  }
};
