import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import Accounts from '../models/Accounts';
import Integrations from '../models/Integrations';
import { sendRequest } from '../utils';
import loginMiddleware from './loginMiddleware';
import { Conversations } from './models';
import receiveMessage from './receiveMessage';
import { getPageAccessToken, getPageList, graphRequest } from './utils';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.post('/facebook/create-integration', async (req, res) => {
    const { accountId, integrationId, data } = req.body;
    const facebookPageIds = JSON.parse(data).pageIds;

    await Integrations.create({
      kind: 'facebook',
      accountId,
      erxesApiId: integrationId,
      facebookPageIds,
    });

    const { ENDPOINT_URL, DOMAIN } = process.env;

    if (ENDPOINT_URL) {
      await sendRequest({
        url: ENDPOINT_URL,
        method: 'POST',
        body: {
          domain: DOMAIN,
          facebookPageIds,
        },
      });
    }

    return res.json({ status: 'ok ' });
  });

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

  const adapter = new FacebookAdapter({
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    getAccessTokenForPage: async (pageId: string) => {
      const integration = await Integrations.findOne({ facebookPageIds: { $in: [pageId] } });

      if (!integration) {
        return;
      }

      const account = await Accounts.findOne({ _id: integration.accountId });
      const token = await getPageAccessToken(pageId, account.token);

      return token;
    },
  });

  const controller = new Botkit({
    webhook_uri: '/facebook/receive',
    webserver: app,
    adapter,
  });

  // Once the bot has booted up its internal services, you can use them to do stuff.
  controller.ready(() => {
    controller.on('message', async (_bot, message) => {
      receiveMessage(adapter, message);
    });
  });
};

export default init;
