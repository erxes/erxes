import { IModels } from '~/connectionResolvers';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { getOrCreateCustomer } from '@/integrations/facebook/controller/store';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import { debugFacebook } from '@/integrations/facebook/debuggers';
import { Activity } from '@/integrations/facebook/@types/utils';
import { pConversationClientMessageInserted } from '~/modules/inbox/graphql/resolvers/mutations/widget';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import {
  checkIsBot,
  triggerFacebookAutomation,
} from '@/integrations/facebook/meta/automation/utils/messageUtils';

export const receiveMessage = async (
  models: IModels,
  subdomain: string,
  integration: IFacebookIntegrationDocument,
  activity: Activity,
) => {
  try {
    debugFacebook(
      `Received message: ${activity.text} from ${activity.from.id}`,
    );
    const { recipient, from, timestamp, channelData } = activity;
    let { message, postback } = channelData;
    const pageId = recipient.id;
    const userId = from.id;
    const kind = INTEGRATION_KINDS.MESSENGER;
    const mid = channelData.message?.mid || postback?.mid;
    const attachments = channelData.message?.attachments;

    let text = activity.text || message?.text;
    let adData;

    if (!text && !message && !!postback) {
      text = postback.title;

      message = {
        mid: postback.mid,
      };

      if (postback.payload) {
        message.payload = postback.payload;
      }
    }

    if (message?.quick_reply) {
      message.payload = message.quick_reply.payload;
    }

    const customer = await getOrCreateCustomer(
      models,
      subdomain,
      pageId,
      userId,
      kind,
    );
    if (!customer) {
      throw new Error('Customer not found');
    }

    let conversation = await models.FacebookConversations.findOne({
      senderId: userId,
      recipientId: pageId,
    });

    const bot = await checkIsBot(models, message, recipient.id);
    const botId = bot?._id;

    // create conversation
    if (!conversation) {
      // save on integrations db
      try {
        conversation = await models.FacebookConversations.create({
          timestamp,
          senderId: userId,
          recipientId: pageId,
          content: text,
          integrationId: integration._id,
          isBot: !!botId,
          botId,
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: conversation duplication'
            : e,
        );
      }
    } else {
      const bot = await models.FacebookBots.findOne({ _id: botId });

      if (bot) {
        conversation.botId = botId;
      }
      conversation.content = text || '';
    }

    const formattedAttachments = (attachments || [])
      .filter((att) => att.type !== 'fallback')
      .map((att) => ({
        type: att.type,
        url: att.payload ? att.payload.url : '',
      }));

    // save on api
    try {
      const data = {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: formattedAttachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp,
        }),
      };

      const apiConversationResponse = await receiveInboxMessage(
        subdomain,
        data,
      );

      if (apiConversationResponse.status === 'success') {
        conversation.erxesApiId = apiConversationResponse.data._id;

        await conversation.save();
      } else {
        throw new Error(
          `Conversation creation failed: ${JSON.stringify(
            apiConversationResponse,
          )}`,
        );
      }
    } catch (e) {
      await models.FacebookConversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }
    // get conversation message
    let conversationMessage = await models.FacebookConversationMessages.findOne(
      {
        mid: mid,
      },
    );
    if (!conversationMessage) {
      try {
        const created = await models.FacebookConversationMessages.create({
          conversationId: conversation._id,
          mid: mid,
          createdAt: timestamp,
          content: text,
          customerId: customer.erxesApiId,
          attachments: formattedAttachments,
          botId,
        });

        const doc = {
          ...created.toObject(),
          conversationId: conversation.erxesApiId,
        };

        await pConversationClientMessageInserted(subdomain, doc);

        await graphqlPubsub.publish(
          `conversationMessageInserted:${conversation.erxesApiId}`,
          {
            conversationMessageInserted: {
              ...created.toObject(),
              conversationId: conversation.erxesApiId,
            },
          },
        );

        conversationMessage = created;

        await triggerFacebookAutomation(subdomain, {
          conversationMessage: conversationMessage.toObject(),
          payload: message?.payload,
          adData,
        });
      } catch (e) {
        throw new Error(
          e.message.includes('duplicate')
            ? 'Concurrent request: conversation message duplication'
            : e,
        );
      }
    }
  } catch (error) {
    throw new Error(`Error processing Facebook message: ${error.message}.`);
  }
};
