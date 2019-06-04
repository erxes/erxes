import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import Accounts from '../models/Accounts';
import Integrations, { IIntegration } from '../models/Integrations';
import { fetchMainApi } from '../utils';
import loginMiddleware from './loginMiddleware';
import { Conversations, Customers } from './models';
import { getPageAccessToken, getPageList, graphRequest } from './utils';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.get('/facebook/get-pages', async (req, res) => {
    const account = await Accounts.findOne({ _id: req.query.accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    const accessToken = account.token;

    const pages = await getPageList(accessToken);

    return res.json(pages);
  });

  app.post('/facebook/reply', async (req, res) => {
    const { integrationId, conversationId, content } = req.body;

    const integration = await Integrations.findOne({ erxesApiId: integrationId });

    if (!integration) {
      return res.json({ status: 'error', error: 'Integration not found' });
    }

    const account = await Accounts.findOne({ _id: integration.accountId });

    if (!account) {
      return res.json({ status: 'error', error: 'Account not found' });
    }

    const conversation = await Conversations.findOne({ erxesApiId: conversationId });

    if (!conversation) {
      return res.json({ status: 'error', error: 'Conversation not found' });
    }

    const pageAccessToken = await getPageAccessToken(conversation.recipientId, account.token);

    const response = await graphRequest.post('me/messages', pageAccessToken, {
      recipient: { id: conversation.senderId },
      message: {
        text: content,
      },
    });

    return res.json(response);
  });

  const integrations = await Integrations.find({ kind: 'facebook' });

  for (const integration of integrations) {
    const { facebookPageIds } = integration;
    const account = await Accounts.findOne({ _id: integration.accountId });

    for (const pageId of facebookPageIds || []) {
      const pageAccessToken = await getPageAccessToken(pageId, account.token);

      await trackPage(app, integration, pageAccessToken);
    }
  }
};

const trackPage = async (app, integration: IIntegration, pageAccessToken: string) => {
  const adapter = new FacebookAdapter({
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    access_token: pageAccessToken,
    app_secret: process.env.FACEBOOK_APP_SECRET,
  });

  const controller = new Botkit({
    webhook_uri: '/facebook/receive',
    webserver: app,
    adapter,
  });

  const api = await adapter.getAPI(controller.getConfig());

  // Once the bot has booted up its internal services, you can use them to do stuff.
  controller.ready(() => {
    controller.on('message', async (bot, message) => {
      // get customer
      let customer = await Customers.findOne({ userId: message.user });

      // create customer
      if (!customer) {
        const response = await api.callAPI(`/${message.user}`, 'GET', {});

        // save on api
        const apiCustomerResponse = await fetchMainApi({
          path: '/integrations-api',
          method: 'POST',
          body: {
            action: 'create-customer',
            payload: JSON.stringify({
              firstName: response.first_name,
              lastName: response.last_name,
              avatar: response.profile_pic,
            }),
          },
        });

        // save on integrations db
        customer = await Customers.create({
          userId: message.user,
          erxesApiId: apiCustomerResponse._id,
          firstName: response.first_name,
          lastName: response.last_name,
          profilePic: response.profile_pic,
        });
      }

      // get conversation
      let conversation = await Conversations.findOne({
        senderId: message.sender.id,
        recipientId: message.recipient.id,
      });

      // create conversation
      if (!conversation) {
        // save on api
        const apiConversationResponse = await fetchMainApi({
          path: '/integrations-api',
          method: 'POST',
          body: {
            action: 'create-conversation',
            payload: JSON.stringify({
              customerId: customer.erxesApiId,
              integrationId: integration.erxesApiId,
              content: message.text,
            }),
          },
        });

        // save on integrations db
        conversation = await Conversations.create({
          erxesApiId: apiConversationResponse._id,
          timestamp: message.timestamp,
          senderId: message.sender.id,
          recipientId: message.recipient.id,
          content: message.text,
        });
      }

      // save message on api
      await fetchMainApi({
        path: '/integrations-api',
        method: 'POST',
        body: {
          action: 'create-conversation-message',
          payload: JSON.stringify({
            content: message.text,
            conversationId: conversation.erxesApiId,
            customerId: customer.erxesApiId,
          }),
        },
      });

      await bot.reply(message, 'Welcome to the channel!');
    });
  });
};

export default init;
