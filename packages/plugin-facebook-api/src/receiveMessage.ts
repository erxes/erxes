import { Activity } from 'botbuilder';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';
import { putCreateLog } from './logUtils';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IChannelData } from './types';

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  activity: Activity,
) => {
  let {
    recipient,
    sender,
    timestamp,
    text,
    attachments = [],
    message,
    postback,
  } = activity.channelData as IChannelData;

  if (!text && !message && !!postback) {
    text = postback.title;

    message = {
      mid: postback.mid,
    };

    if (text !== 'Get Started') {
      if (postback.payload) {
        message.payload = postback.payload;
      }
    }
  }
  if (message.quick_reply) {
    message.payload = message.quick_reply.payload;
  }

  const integration = await models.Integrations.getIntegration({
    $and: [
      { facebookPageIds: { $in: [recipient.id] } },
      { kind: INTEGRATION_KINDS.MESSENGER },
    ],
  });

  const userId = sender.id;
  const pageId = recipient.id;
  const kind = INTEGRATION_KINDS.MESSENGER;

  // get or create customer
  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    userId,
    kind,
  );

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id,
  });

  const isBot = postback && postback.title === 'Get Started' ? true : false;
  const botId = isBot ? postback.payload : undefined;

  // create conversation
  if (!conversation) {
    // save on integrations db

    try {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
        integrationId: integration._id,
        isBot,
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
    const bot = await models.Bots.findOne({ _id: botId });

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
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: formattedAttachments,
          conversationId: conversation.erxesApiId,
          updatedAt: timestamp,
        }),
      },
      isRPC: true,
    });

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }
  // get conversation message
  let conversationMessage = await models.ConversationMessages.findOne({
    mid: message.mid,
  });

  if (!conversationMessage) {
    try {
      const created = await models.ConversationMessages.create({
        conversationId: conversation._id,
        mid: message.mid,
        createdAt: timestamp,
        content: text,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId,
      });

      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId,
        },
      });

      graphqlPubsub.publish(
        `conversationMessageInserted:${conversation.erxesApiId}`,
        {
          conversationMessageInserted: {
            ...created.toObject(),
            conversationId: conversation.erxesApiId,
          },
        },
      );

      conversationMessage = created;
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e,
      );
    }
  }

  try {
    await putCreateLog(
      models,
      subdomain,
      {
        type: 'messages',
        newData: message,
        object: {
          ...conversationMessage.toObject(),
          payload: JSON.parse(message.payload || '{}'),
        },
      },
      customer._id,
    );
  } catch (error) {}
};

export default receiveMessage;
