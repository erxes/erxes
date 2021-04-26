import { debugRequest, debugResponse, debugWhatsapp } from '../debuggers';
import { routeErrorHandling } from '../helpers';
import { Integrations } from '../models';
import * as whatsappUtils from './api';
import { ConversationMessages, Conversations } from './models';
import receiveMessage from './receiveMessage';

const init = async app => {
  app.post(
    '/whatsapp/webhook',
    routeErrorHandling(async (req, res) => {
      await receiveMessage(req.body);

      res.sendStatus(200);
    })
  );

  app.post(
    '/whatsapp/create-integration',
    routeErrorHandling(async (req, res) => {
      debugRequest(debugWhatsapp, req);

      const { integrationId, data } = req.body;
      const { instanceId, token } = JSON.parse(data);

      await whatsappUtils.saveInstance(integrationId, instanceId, token);

      return res.json({ status: 'ok' });
    })
  );

  app.post(
    '/whatsapp/reply',
    routeErrorHandling(async (req, res) => {
      const { attachments, conversationId, content, integrationId } = req.body;

      const conversation = await Conversations.getConversation({
        erxesApiId: conversationId
      });

      const recipientId = conversation.recipientId;
      const instanceId = conversation.instanceId;

      const integration = await Integrations.findOne({
        erxesApiId: integrationId
      });

      const token = integration.whatsappToken;

      if (attachments.length !== 0) {
        for (const attachment of attachments) {
          const file = {
            receiverId: recipientId,
            body: attachment.url,
            filename: attachment.name,
            caption: content,
            instanceId,
            token
          };
          try {
            await whatsappUtils.sendFile(file);
          } catch (e) {
            throw new Error(e);
          }
        }
      } else {
        try {
          const message = await whatsappUtils.reply(
            recipientId,
            content,
            instanceId,
            token
          );

          await ConversationMessages.create({
            conversationId: conversation._id,
            mid: message.id,
            content
          });
        } catch (e) {
          throw new Error(e);
        }
      }

      debugResponse(debugWhatsapp, req);

      res.sendStatus(200);
    })
  );
};

export default init;
