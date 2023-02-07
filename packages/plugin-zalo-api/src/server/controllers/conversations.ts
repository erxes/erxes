import { generateModels, IModels } from '../../models';
import { sendInboxMessage } from '../brokers';
import { debug, graphqlPubsub } from '../../configs';
import { getSubdomain } from '@erxes/api-utils/src/core';
import {
  convertAttachment,
  getMessageOAID,
  getMessageUserID,
  isAnonymousUser,
  isOASend
} from '../../utils';
import { createOrUpdateCustomer } from './customers';

export const createOrUpdateConversation = async (
  models: IModels,
  subdomain: any,
  data: any = {}
) => {
  // debug.error(`data before createConversationMessage: ${JSON.stringify(data)}`);

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: data.userId,
    recipientId: data.oa_id
  });

  // create conversation
  if (!conversation) {
    // save on db
    try {
      let documentData: { [key: string]: any } = {
        timestamp: data.timestamp,
        senderId: data.userId,
        recipientId: data.oa_id,
        content: data?.message?.text,
        integrationId: data.integrationId
      };
      if (data?.message?.conversation_id) {
        documentData.zaloConversationId = data?.message?.conversation_id;
      }
      conversation = await models.Conversations.create(documentData);
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
      );
    }
  }
  // save on api
  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: data.customerId,
          integrationId: data.integrationErxesApiId,
          content: data?.message?.text,
          conversationId: conversation.erxesApiId,
          attachments: []
          //     .filter((att) => att.type !== "fallback")
          //     .map((att) => ({
          //         type: att.type,
          //         url: att.payload ? att.payload.url : "",
          //     })),
        })
      },
      isRPC: true
    });

    conversation.erxesApiId = apiConversationResponse._id;

    // console.log(`apiConversationResponse: ${apiConversationResponse}`);

    await conversation.save();
  } catch (e) {
    await models.Conversations.deleteOne({
      _id: conversation._id
    });
    throw new Error(e);
  }
  await createConversationMessage(models, subdomain, conversation, data);
};

export const createConversationMessage = async (
  models: IModels,
  subdomain,
  conversation,
  data
) => {
  // get conversation message
  const conversationMessage = await models.ConversationMessages.findOne({
    mid: data.message.msg_id
  });

  let userId: any = false;

  if (data?.isOASend) {
    const conversationMessageHasUser = await models.ConversationMessages.find({
      $and: [
        {
          userId: { $exists: true, $ne: '' }
        },
        {
          conversationId: conversation._id
        }
      ]
    }).limit(1);

    userId = conversationMessageHasUser?.[0]?.userId;

    if (conversationMessageHasUser?.length < 1) {
      const getUserIds = await sendInboxMessage({
        subdomain,
        action: 'integrations.receive',
        data: {
          action: 'getUserIds'
        },
        isRPC: true
      });

      userId = getUserIds?.userIds?.[0];
    }
  }

  if (!conversationMessage) {
    try {
      let messageData: { [key: string]: any } = {
        conversationId: conversation._id,
        mid: data?.message?.msg_id,
        createdAt: data?.message?.timestamp,
        content: data?.message?.text,
        customerId: data?.customerId,
        // userId: data?.userId,
        attachments: data?.message?.attachments
      };

      if (userId && data?.isOASend) {
        messageData.userId = userId;
        delete messageData.customerId;
      }

      const created = await models.ConversationMessages.create(messageData);

      console.log('models.ConversationMessages.create', created.toObject());

      graphqlPubsub.publish('conversationClientMessageInserted', {
        conversationClientMessageInserted: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });

      graphqlPubsub.publish('conversationMessageInserted', {
        conversationMessageInserted: {
          ...created.toObject(),
          conversationId: conversation.erxesApiId
        }
      });
    } catch (e) {
      debug.error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }
  }
};

export const receiveMessage = async req => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const data = req.body;

  console.log('Zalo receive:', data);

  const oa_id = getMessageOAID(data);
  const userId = getMessageUserID(data);

  const integration = await models.Integrations.getIntegration({
    $and: [{ oa_id: { $in: oa_id } }, { kind: 'zalo' }]
  });

  if (!integration) {
    debug.error(JSON.stringify(integration));
    return;
  }

  const customer = await createOrUpdateCustomer(models, subdomain, {
    userId,
    oa_id,
    integrationId: integration?.erxesApiId,
    checkFollower: true,
    isAnonymous: isAnonymousUser(data?.event_name)
  });

  await createOrUpdateConversation(models, subdomain, {
    integrationId: integration?._id,
    userId /* : isOASend(data?.event_name) ? null : userId */,
    oa_id,
    customerId: customer?.erxesApiId,
    integrationErxesApiId: integration?.erxesApiId,
    isOASend: isOASend(data?.event_name),
    message: {
      ...data.message,
      attachments: convertAttachment(data?.message?.attachments),
      timestamp: new Date(+data.timestamp) || new Date()
    }
  });
};
