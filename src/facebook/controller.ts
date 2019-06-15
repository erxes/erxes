import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import { debugFacebook } from '../debuggers';
import Accounts from '../models/Accounts';
import Integrations from '../models/Integrations';
import { sendRequest } from '../utils';
import loginMiddleware from './loginMiddleware';
import { Conversations } from './models';
import receiveMessage from './receiveMessage';
import { getPageAccessToken, getPageList, graphRequest } from './utils';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.post('/facebook/create-integration', async (req, res, next) => {
    debugFacebook(`Receiving create-integration request from ${req.headers.host}, body: ${JSON.stringify(req.body)}`);

    const { accountId, integrationId, data } = req.body;
    const facebookPageIds = JSON.parse(data).pageIds;

    const integration = await Integrations.create({
      kind: 'facebook',
      accountId,
      erxesApiId: integrationId,
      facebookPageIds,
    });

    const { ENDPOINT_URL, DOMAIN } = process.env;

    if (ENDPOINT_URL) {
      try {
        await sendRequest({
          url: ENDPOINT_URL,
          method: 'POST',
          body: {
            domain: DOMAIN,
            facebookPageIds,
          },
        });
      } catch (e) {
        await Integrations.remove({ _id: integration._id });
        return next(e);
      }
    }

    debugFacebook(`Responding create-integration request to ${req.headers.host} with success`);

    return res.json({ status: 'ok ' });
  });

  app.get('/facebook/get-pages', async (req, res, next) => {
    debugFacebook(`Receiving get-pages request from ${req.headers.host}, queryParams: ${JSON.stringify(req.query)}`);

    const account = await Accounts.findOne({ _id: req.query.accountId });

    if (!account) {
      return next(new Error('Account not found'));
    }

    const accessToken = account.token;

    let pages = [];

    try {
      pages = await getPageList(accessToken);
    } catch (e) {
      debugFacebook(`Error occured while connecting to facebook ${e.message}`);
      return next(e);
    }

    debugFacebook(`Responding get-pages request to ${req.headers.host} with ${JSON.stringify(pages)}`);

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
      await receiveMessage(adapter, message);
    });
  });
};

export default init;
