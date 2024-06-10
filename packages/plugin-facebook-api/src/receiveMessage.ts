import { Activity } from 'botbuilder';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';
import { putCreateLog } from './logUtils';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IChannelData } from './types';

const checkIsBot = async (models: IModels, message, recipientId) => {
  if (message?.payload) {
    const payload = JSON.parse(message?.payload || '{}');
    if (payload.botId) {
      return payload.botId;
    }
  }

  const bot = await models.Bots.findOne({ pageId: recipientId });

  return bot?._id;
};

const receiveMessage = async (
  models: IModels,
  subdomain: string,
  activity: Activity
) => {
  console.log('received message');
  let {
    recipient,
    sender,
    timestamp,
    text,
    attachments = [],
    message,
    postback
  } = activity.channelData as IChannelData;

  if (!text && !message && !!postback) {
    text = postback.title;

    message = {
      mid: postback.mid
    };

    if (postback.payload) {
      message.payload = postback.payload;
    }
  }
  if (message.quick_reply) {
    message.payload = message.quick_reply.payload;
  }

  console.log('startging message');

  const integration = await models.Integrations.getIntegration({
    $and: [
      { facebookPageIds: { $in: [recipient.id] } },
      { kind: INTEGRATION_KINDS.MESSENGER }
    ]
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
    kind
  );

  console.log('Customer:', !!customer);

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  console.log('conversation:');

  const botId = await checkIsBot(models, message, recipient.id);

  console.log('botId:', botId);

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
        isBot: !!botId,
        botId
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
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
      url: att.payload ? att.payload.url : ''
    }));

  console.log('formattedAttachments:');

  // save on api
  try {
    console.log('create-or-update-conversation');
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
          updatedAt: timestamp
        })
      },
      isRPC: true
    });

    console.log('create-or-update-conversation Done:');

    conversation.erxesApiId = apiConversationResponse._id;

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({ _id: conversation._id });
    throw new Error(e);
  }
  // get conversation message
  let conversationMessage = await models.ConversationMessages.findOne({
    mid: message.mid
  });

  console.log('conversation Message');
  if (!conversationMessage) {
    console.log('conversation Message dasc');
    try {
      const created = await models.ConversationMessages.create({
        conversationId: conversation._id,
        mid: message.mid,
        createdAt: timestamp,
        content: text,
        customerId: customer.erxesApiId,
        attachments: formattedAttachments,
        botId
      });
      console.log('created');
      await sendInboxMessage({
        subdomain,
        action: 'conversationClientMessageInserted',
        data: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });

      console.log('pubsub');

      graphqlPubsub.publish(
        `conversationMessageInserted:${conversation.erxesApiId}`,
        {
          conversationMessageInserted: {
            ...created.toObject(),
            conversationId: conversation.erxesApiId
          }
        }
      );
      console.log('pubsub Done');
      conversationMessage = created;
      console.log({ payload: JSON.parse(message.payload || '{}') });
      await putCreateLog(
        models,
        subdomain,
        {
          type: 'messages',
          newData: message,
          object: {
            ...conversationMessage.toObject(),
            payload: JSON.parse(message.payload || '{}')
          }
        },
        customer._id
      );
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }
  }
};

export default receiveMessage;
