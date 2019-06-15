import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { Botkit } from 'botkit';
import { debugFacebook, debugRequest, debugResponse } from '../debuggers';
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
    debugRequest(debugFacebook, req);

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

    debugResponse(debugFacebook, req);

    return res.json({ status: 'ok ' });
  });

  app.get('/facebook/get-pages', async (req, res, next) => {
    debugRequest(debugFacebook, req);

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

    debugResponse(debugFacebook, req, JSON.stringify(pages));

    return res.json(pages);
  });

  app.post('/facebook/reply', async (req, res, next) => {
    debugRequest(debugFacebook, req);

    const { integrationId, conversationId, content } = req.body;

    const integration = await Integrations.findOne({ erxesApiId: integrationId });

    if (!integration) {
      debugFacebook('Integration not found');
      return next(new Error('Integration not found'));
    }

    const account = await Accounts.findOne({ _id: integration.accountId });

    if (!account) {
      debugFacebook('Account not found');
      return next(new Error('Account not found'));
    }

    const conversation = await Conversations.findOne({ erxesApiId: conversationId });

    if (!conversation) {
      debugFacebook('Conversation not found');
      return next(new Error('Conversation not found'));
    }

    let pageAccessToken;

    try {
      pageAccessToken = await getPageAccessToken(conversation.recipientId, account.token);
    } catch (e) {
      debugFacebook(
        `Error ocurred while trying to get page access token with ${conversation.recipientId} ${account.token}`,
      );
      return next(e);
    }

    const data = {
      recipient: { id: conversation.senderId },
      message: {
        text: content,
      },
    };

    try {
      const response = await graphRequest.post('me/messages', pageAccessToken, data);
      debugFacebook(`Successfully sent data to facebook ${JSON.stringify(data)}`);
      return res.json(response);
    } catch (e) {
      debugFacebook(`Error ocurred while trying to send post request to facebook ${JSON.stringify(data)}`);
    }
  });

  const adapter = new FacebookAdapter({
    verify_token: process.env.FACEBOOK_VERIFY_TOKEN,
    app_secret: process.env.FACEBOOK_APP_SECRET,
    getAccessTokenForPage: async (pageId: string) => {
      const integration = await Integrations.findOne({ facebookPageIds: { $in: [pageId] } });

      if (!integration) {
        debugFacebook(`Integration not found with pageId: ${pageId}`);
        return;
      }

      debugFacebook(`Integration found with pageId: ${pageId}`);

      const account = await Accounts.findOne({ _id: integration.accountId });

      if (!account) {
        debugFacebook(`Account not found with _id: ${integration.accountId}`);
        return;
      }

      debugFacebook(`Account found with _id: ${integration.accountId}`);

      try {
        const token = await getPageAccessToken(pageId, account.token);

        return token;
      } catch (e) {
        debugFacebook(`Error occurred while trying to get pag access token with ${account.token}`);
      }
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
      debugFacebook(`Received webhook message ${JSON.stringify(message)}`);

      await receiveMessage(adapter, message);
    });
  });
};

export default init;
