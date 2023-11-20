import { Activity } from 'botbuilder';
import { graphqlPubsub } from './configs';

import { IModels } from './connectionResolver';
import { sendInboxMessage } from './messageBroker';
import { getOrCreateCustomer } from './store';
import { IMessageData } from './types';
import { INTEGRATION_KINDS } from './constants';
import { sendRPCMessage } from './messageBroker';
// const receiveMessage = async (
//   models: IModels,
//   subdomain: string,
//   activity: Activity
// ) => {
//   const {
//     recipient,
//     sender,
//     timestamp,
//     text,
//     attachments = [],
//     message
//   } = activity.channelData as IChannelData;

//   const integration = await models.Integrations.getIntegration({
//     $and: [
//       { instagramPageId: { $in: [recipient.id] } },
//       { kind: INTEGRATION_KINDS.MESSENGER }
//     ]
//   });

//   const userId = sender.id;
//   const pageId = recipient.id;
//   const kind = INTEGRATION_KINDS.MESSENGER;

//   // get or create customer
//   const customer = await getOrCreateCustomer(
//     models,
//     subdomain,
//     pageId,
//     userId,
//     kind
//   );

//   // get conversation
//   let conversation = await models.Conversations.findOne({
//     senderId: userId
//   });

//   // create conversation
//   if (!conversation) {
//     // save on integrations db
//     try {
//       conversation = await models.Conversations.create({
//         timestamp,
//         senderId: userId,
//         content: text,
//         integrationId: integration._id
//       });
//     } catch (e) {
//       throw new Error(
//         e.message.includes('duplicate')
//           ? 'Concurrent request: conversation duplication'
//           : e
//       );
//     }
//   }

//   const formattedAttachments = (attachments || [])
//     .filter((att) => att.type !== 'fallback')
//     .map((att) => ({
//       type: att.type,
//       url: att.payload ? att.payload.url : ''
//     }));

//   // save on api
//   try {
//     const apiConversationResponse = await sendInboxMessage({
//       subdomain,
//       action: 'integrations.receive',
//       data: {
//         action: 'create-or-update-conversation',
//         payload: JSON.stringify({
//           customerId: customer.erxesApiId,
//           integrationId: integration.erxesApiId,
//           content: text || '',
//           attachments: formattedAttachments,
//           conversationId: conversation.erxesApiId,
//           updatedAt: timestamp
//         })
//       },
//       isRPC: true
//     });

//     conversation.erxesApiId = apiConversationResponse._id;

//     await conversation.save();
//   } catch (e) {
//     await models.Conversations.deleteOne({ _id: conversation._id });
//     throw new Error(e);
//   }

//   // get conversation message
//   const conversationMessage = await models.ConversationMessages.findOne({
//     mid: message.mid
//   });

//   if (!conversationMessage) {
//     try {
//       const created = await models.ConversationMessages.create({
//         conversationId: conversation._id,
//         mid: message.mid,
//         createdAt: timestamp,
//         content: text,
//         customerId: customer.erxesApiId,
//         attachments: formattedAttachments
//       });

//       await sendInboxMessage({
//         subdomain,
//         action: 'conversationClientMessageInserted',
//         data: {
//           ...created.toObject(),
//           conversationId: conversation.erxesApiId
//         }
//       });

//       graphqlPubsub.publish('conversationMessageInserted', {
//         conversationMessageInserted: {
//           ...created.toObject(),
//           conversationId: conversation.erxesApiId
//         }
//       });
//     } catch (e) {
//       throw new Error(
//         e.message.includes('duplicate')
//           ? 'Concurrent request: conversation message duplication'
//           : e
//       );
//     }
//   }
// };

const receiveMessage = async (models: IModels, messageData: IMessageData) => {
  const { recipient, sender, timestamp, attachments, message } = messageData;

  const integration = await models.Integrations.getIntegration({
    $and: [{ instagramPageId: { $in: [recipient.id] } }, { kind: 'instagram' }]
  });

  const { facebookPageTokensMap, facebookPageIds } = integration;

  const userId = sender.id;
  const pageId = recipient.id;
  const { text, mid } = message;

  // get or create customer

  let customer;
  if (facebookPageIds && facebookPageTokensMap) {
    customer = await getOrCreateCustomer(
      models,
      pageId,
      userId,
      facebookPageIds,
      facebookPageTokensMap
    );
    // Rest of your code...
  } else {
    // Handle the case where facebookPageIds or facebookPageTokensMap is undefined
    console.error('facebookPageIds or facebookPageTokensMap is undefined.');
  }

  // get conversation
  let conversation = await models.Conversations.findOne({
    senderId: userId,
    recipientId: recipient.id
  });

  // create conversation
  if (!conversation) {
    // save on integrations db
    try {
      conversation = await models.Conversations.create({
        timestamp,
        senderId: userId,
        recipientId: recipient.id,
        content: text,
        integrationId: integration._id
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation duplication'
          : e
      );
    }

    // save on api
    try {
      const apiConversationResponse = await sendRPCMessage({
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text || '',
          attachments: (attachments || [])
            .filter(att => att.type !== 'fallback')
            .map(att => ({
              type: att.type,
              url: att.payload ? att.payload.url : ''
            }))
        })
      });

      conversation.erxesApiId = apiConversationResponse._id;

      await conversation.save();
    } catch (e) {
      await models.Conversations.deleteOne({ _id: conversation._id });
      throw new Error(e);
    }
  }

  // get conversation message
  const conversationMessage = await models.ConversationMessages.findOne({
    mid
  });

  if (!conversationMessage) {
    // save on integrations db
    try {
      await models.ConversationMessages.create({
        conversationId: conversation._id,
        mid,
        timestamp,
        content: text
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: conversation message duplication'
          : e
      );
    }

    // save message on api
    try {
      await sendRPCMessage({
        action: 'create-conversation-message',
        metaInfo: 'replaceContent',
        payload: JSON.stringify({
          content: text || '',
          attachments: (attachments || [])
            .filter(att => att.type !== 'fallback')
            .map(att => ({
              type: att.type,
              url: att.payload ? att.payload.url : ''
            })),
          conversationId: conversation.erxesApiId,
          customerId: customer.erxesApiId
        })
      });
    } catch (e) {
      await models.ConversationMessages.deleteOne({ mid: message.mid });
      throw new Error(e);
    }
  }
};

export default receiveMessage;
