import { debugProductBoard, debugRequest } from '../debuggers';
import { Integrations } from '../models';
import {
  NylasImapConversationMessages,
  NylasImapConversations
} from '../nylas/models';
import { getConfig, getEnv, sendRequest } from '../utils';
import { Conversations } from './models';

const init = async app => {
  app.get('/productBoard/note', async (req, res) => {
    const { erxesApiId } = req.query;
    try {
      const conversation = await Conversations.findOne({ erxesApiId });

      return res.send(conversation.productBoardLink);
    } catch (e) {
      return res.send('');
    }
  });

  app.post('/productBoard/create-note', async (req, res, next) => {
    debugRequest(debugProductBoard, req);

    const PRODUCT_BOARD_TOKEN = await getConfig('PRODUCT_BOARD_TOKEN');
    const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

    const {
      customer,
      messages,
      tags,
      erxesApiConversationId,
      user,
      integrationId
    } = req.body;

    const integration = await Integrations.findOne({
      erxesApiId: integrationId
    });

    let content = '';

    for (const message of messages) {
      const messageDate = new Date(message.createdAt).toUTCString();

      if (message.customerId) {
        content = content.concat(
          `<b>${customer.primaryEmail}</b> <i>${messageDate}</i><p>${message.content}</p><hr>`
        );

        if (message.formWidgetData) {
          message.formWidgetData.forEach(field => {
            content = content.concat(
              `<b>${field.text} : ${field.value}</b> <hr>`
            );
          });
        }
      } else {
        content = content.concat(
          `<b>${user.details.fullName}</b> <i>${messageDate}</i><p>${message.content}</p><hr>`
        );
      }

      if (message.attachments) {
        for (const attachment of message.attachments) {
          content = content.concat(
            `<a href="${attachment.url}">${attachment.name}</a><hr>`
          );
        }
      }
    }

    if (integration && integration.kind === 'nylas-imap') {
      const conversation = await NylasImapConversations.findOne({
        erxesApiId: erxesApiConversationId
      });
      const conversationMessages = await NylasImapConversationMessages.find({
        conversationId: conversation._id
      });

      conversationMessages.forEach(conversationMessage => {
        content = content.concat(
          `<b>${user.details.fullName}</b> <i>${new Date(
            conversationMessage.date
          )}</i> <p>${conversationMessage.body}</p><hr>`
        );
      });
    }

    const origin = messages[messages.length - 1].content;

    try {
      const result = await sendRequest({
        url: 'https://api.productboard.com/notes',
        method: 'POST',
        headerParams: {
          authorization: `Bearer ${PRODUCT_BOARD_TOKEN}`
        },
        body: {
          title: messages[0].content,
          content,
          customer_email: customer.primaryEmail,
          display_url: `${MAIN_APP_DOMAIN}/inbox/?_id=${erxesApiConversationId}`,
          source: {
            origin,
            record_id: erxesApiConversationId
          },
          tags: tags.map(tag => tag.name)
        }
      });

      await Conversations.create({
        timestamp: new Date(),
        erxesApiId: erxesApiConversationId,
        productBoardLink: result.links.html
      });

      return res.send(result.links.html);
    } catch (e) {
      if (e.statusCode === 422) {
        next(new Error('already exists'));
      } else if (e.statusCode === 401) {
        next(
          new Error(
            'Please enter the product board access token in system config.'
          )
        );
      }
      next(e);
    }
  });
};

export default init;
