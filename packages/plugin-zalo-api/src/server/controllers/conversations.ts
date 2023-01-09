import { generateModels, IModels } from '../../models';
import { sendInboxMessage } from '../brokers';
import { debug, graphqlPubsub } from '../../configs';
import { getSubdomain } from '@erxes/api-utils/src/core';
import {
  convertAttachment,
  getMessageOAID,
  getMessageUserID,
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
  await createConversationMessage(models, conversation, data);
};

export const createConversationMessage = async (
  models: IModels,
  conversation,
  data
) => {
  // get conversation message
  const conversationMessage = await models.ConversationMessages.findOne({
    mid: data.message.msg_id
  });

  if (!conversationMessage) {
    try {
      // let dt = {
      //     conversationId: conversation._id,
      //     mid: data?.message?.msg_id,
      //     createdAt: data?.timestamp,
      //     content: data?.message?.text,
      //     customerId: data?.customerId,
      //     userId: data?.userId,
      //     attachments: data?.message?.attachments
      // }
      // debug.error(`start create conversationMessage: ${JSON.stringify(dt)}`);
      // debug.error(`customerId: ${data?.customerId}`);
      // debug.error(`data: ${JSON.stringify(data)}`);

      const created = await models.ConversationMessages.create({
        conversationId: conversation._id,
        mid: data.message.msg_id,
        createdAt: data.message.timestamp,
        content: data.message.text,
        customerId: data.customerId,
        // userId: data?.userId || '',
        attachments: data.message.attachments
      });

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

  debug.error('Receive From Zalo:', JSON.stringify(data));

  const oa_id = getMessageOAID(data);
  const userId = getMessageUserID(data);

  const integration = await models.Integrations.getIntegration({
    $and: [{ oa_id: { $in: oa_id } }, { kind: 'zalo' }]
  });

  if (!integration) {
    debug.error(JSON.stringify(integration));
    return;
  }

  // debug.error(`integration: ${JSON.stringify(integration)}`);

  const customer = await createOrUpdateCustomer(models, subdomain, {
    userId,
    oa_id,
    integrationId: integration?.erxesApiId,
    checkFollower: true
  });

  // debug.error(
  //   `after createOrUpdateCustomer: ${userId} ${JSON.stringify(customer)}`
  // );

  // debug.error(`data before createOrUpdateConversation: ${customer.erxesApiId}, ${JSON.stringify({
  //     integrationId: integration._id,
  //     userId,
  //     oa_id,
  //     customerId: customer.erxesApiId,
  //     integrationErxesApiId: integration.erxesApiId,
  //     message: {
  //         ...data.message,
  //         timestamp: data.timestamp,
  //     },
  // })}`);

  await createOrUpdateConversation(models, subdomain, {
    integrationId: integration?._id,
    userId /* : isOASend(data?.event_name) ? null : userId */,
    oa_id,
    customerId: customer?.erxesApiId,
    integrationErxesApiId: integration?.erxesApiId,
    message: {
      ...data.message,
      attachments: convertAttachment(data?.message?.attachments),
      timestamp: new Date(+data.timestamp) || new Date()
    }
  });
};
