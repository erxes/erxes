import { debugChatfuel, debugRequest } from '../debuggers';
import { generateAttachmentMessages } from '../facebook/utils';
import { routeErrorHandling } from '../helpers';
import { sendRPCMessage } from '../messageBroker';
import { Integrations } from '../models';
import { sendRequest } from '../utils';
import { ConversationMessages, Conversations, Customers } from './models';

const init = async app => {
  app.post(
    '/chatfuel/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugChatfuel, req);

      const { integrationId, data } = req.body;
      const { code, broadcastToken, botId, blockName } = JSON.parse(
        data || '{}'
      );

      // Check existing Integration
      const integration = await Integrations.findOne({
        kind: 'chatfuel',
        'chatfuelConfigs.code': code
      }).lean();

      if (integration) {
        throw new Error(`Integration already exists with this code: ${code}`);
      }

      try {
        await Integrations.create({
          kind: 'chatfuel',
          erxesApiId: integrationId,
          chatfuelConfigs: {
            code,
            broadcastToken,
            botId,
            blockName
          }
        });
      } catch (e) {
        debugChatfuel(`Failed to create integration: ${e}`);
        throw new Error(e);
      }

      return res.json({ status: 'ok' });
    })
  );

  app.post(
    '/chatfuel-broadcast',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugChatfuel, req);

      const body = req.body;

      const messages: Array<{
        attachment?: { type: string; payload: { url: string } };
        text?: string;
      }> = [{ text: body.content }];

      if (body.attachments) {
        const attachments = JSON.parse(body.attachments);

        for (const message of generateAttachmentMessages(attachments)) {
          messages.push(message);
        }
      }

      debugChatfuel(
        `Sending messages to broadcast ${JSON.stringify(messages)}`
      );

      return res.json({ messages });
    })
  );

  app.post(
    '/chatfuel-receive',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugChatfuel, req);

      const body = req.body;
      const message = body['last user freeform input'];

      if (!message) {
        const errorMessage = 'Message not found';

        debugChatfuel(errorMessage);
        throw new Error(errorMessage);
      }

      const code = req.query.code;
      const integration = await Integrations.findOne({
        'chatfuelConfigs.code': code
      }).lean();

      if (!integration) {
        const errorMessage = `Integration not found with: ${code}`;

        debugChatfuel(errorMessage);
        throw new Error(errorMessage);
      }

      const firstName = body['first name'];
      const lastName = body['last name'];
      const profilePicUrl = body['profile pic url'];
      const chatfuelUserId = body['chatfuel user id'];
      const lastClickedButtonName = body['last clicked button name'];

      // get customer
      let customer = await Customers.findOne({ chatfuelUserId });

      if (!customer) {
        try {
          customer = await Customers.create({
            chatfuelUserId,
            integrationId: integration._id
          });
        } catch (e) {
          const errorMessage = e.message.includes('duplicate')
            ? 'Concurrent request: customer duplication'
            : e.message;

          debugChatfuel(errorMessage);
          throw new Error(errorMessage);
        }

        // save on api
        try {
          const apiCustomerResponse = await sendRPCMessage({
            action: 'get-create-update-customer',
            payload: JSON.stringify({
              integrationId: integration.erxesApiId,
              firstName,
              lastName,
              avatar: profilePicUrl,
              isUser: true
            })
          });
          customer.erxesApiId = apiCustomerResponse._id;
          await customer.save();
        } catch (e) {
          await Customers.deleteOne({ _id: customer._id });
          throw new Error(e);
        }
      }

      // get conversation
      let conversation = await Conversations.findOne({ chatfuelUserId });

      // create conversation
      if (!conversation) {
        // save on integration db
        try {
          conversation = await Conversations.create({
            timestamp: new Date(),
            chatfuelUserId,
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
              content: `Button name: ${lastClickedButtonName}, ${message}`,
              integrationId: integration.erxesApiId
            })
          });

          conversation.erxesApiId = apiConversationResponse._id;
          await conversation.save();
        } catch (e) {
          await Conversations.deleteOne({ _id: conversation._id });
          throw new Error(e);
        }
      }

      // save on integrations db
      const conversationMessage = await ConversationMessages.create({
        content: message,
        conversationId: conversation._id
      });

      // save message on api
      try {
        await sendRPCMessage({
          action: 'create-conversation-message',
          payload: JSON.stringify({
            content: message,
            conversationId: conversation.erxesApiId,
            customerId: customer.erxesApiId
          })
        });
      } catch (e) {
        await ConversationMessages.deleteOne({ _id: conversationMessage._id });
        throw new Error(e);
      }

      res.send({ status: 'success' });
    })
  );

  app.post(
    '/chatfuel/reply',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugChatfuel, req);

      const { content, attachments, conversationId } = req.body;

      const conversation = await Conversations.findOne({
        erxesApiId: conversationId
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${conversationId}`);
      }

      const integration = await Integrations.getIntegration({
        _id: conversation.integrationId
      });
      const configs = integration.chatfuelConfigs || {};

      await sendRequest({
        url: `https://api.chatfuel.com/bots/${configs.botId}/users/${
          conversation.chatfuelUserId
        }/send?chatfuel_token=${
          configs.broadcastToken
        }&chatfuel_message_tag=NON_PROMOTIONAL_SUBSCRIPTION&chatfuel_block_name=${
          configs.blockName
        }&content=${content}&attachments=${JSON.stringify(attachments)}`,
        method: 'POST'
      });

      res.send('success');
    })
  );
};

export default init;
