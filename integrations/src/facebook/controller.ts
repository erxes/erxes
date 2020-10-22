import { FacebookAdapter } from 'botbuilder-adapter-facebook-erxes';
import { debugBase, debugFacebook, debugRequest, debugResponse } from '../debuggers';
import Accounts from '../models/Accounts';
import Integrations from '../models/Integrations';
import { getConfig, getEnv, sendRequest } from '../utils';
import loginMiddleware from './loginMiddleware';
import { Comments, Customers, Posts } from './models';
import receiveComment from './receiveComment';
import receiveMessage from './receiveMessage';
import receivePost from './receivePost';

import { FACEBOOK_POST_TYPES } from './constants';
import { getPageAccessToken, getPageAccessTokenFromMap, getPageList, subscribePage } from './utils';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.post('/facebook/create-integration', async (req, res, next) => {
    debugRequest(debugFacebook, req);

    const { accountId, integrationId, data, kind } = req.body;

    const facebookPageIds = JSON.parse(data).pageIds;

    const account = await Accounts.getAccount({ _id: accountId });

    const integration = await Integrations.create({
      kind,
      accountId,
      erxesApiId: integrationId,
      facebookPageIds,
    });

    const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
    const DOMAIN = getEnv({ name: 'DOMAIN' });

    debugFacebook(`ENDPOINT_URL ${ENDPOINT_URL}`);

    if (ENDPOINT_URL) {
      // send domain to core endpoints
      try {
        await sendRequest({
          url: `${ENDPOINT_URL}/register-endpoint`,
          method: 'POST',
          body: {
            domain: DOMAIN,
            facebookPageIds,
            fbPageIds: facebookPageIds,
          },
        });
      } catch (e) {
        await Integrations.deleteOne({ _id: integration._id });
        return next(e);
      }
    }

    const facebookPageTokensMap: { [key: string]: string } = {};

    for (const pageId of facebookPageIds) {
      try {
        const pageAccessToken = await getPageAccessToken(pageId, account.token);

        facebookPageTokensMap[pageId] = pageAccessToken;

        try {
          await subscribePage(pageId, pageAccessToken);
          debugFacebook(`Successfully subscribed page ${pageId}`);
        } catch (e) {
          debugFacebook(`Error ocurred while trying to subscribe page ${e.message || e}`);
          return next(e);
        }
      } catch (e) {
        debugFacebook(`Error ocurred while trying to get page access token with ${e.message || e}`);
        return next(e);
      }
    }

    integration.facebookPageTokensMap = facebookPageTokensMap;

    await integration.save();

    debugResponse(debugFacebook, req);

    return res.json({ status: 'ok ' });
  });

  app.get('/facebook/get-pages', async (req, res, next) => {
    debugRequest(debugFacebook, req);

    const account = await Accounts.getAccount({ _id: req.query.accountId });

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

  app.get('/facebook/get-post', async (req, res) => {
    debugFacebook(`Request to get post data with: ${JSON.stringify(req.query)}`);

    const { erxesApiId } = req.query;

    const post = await Posts.getPost({ erxesApiId }, true);

    return res.json({
      ...post,
    });
  });

  app.get('/facebook/get-comments-count', async (req, res) => {
    debugFacebook(`Request to get post data with: ${JSON.stringify(req.query)}`);

    const { postId, isResolved = false } = req.query;

    const post = await Posts.getPost({ erxesApiId: postId }, true);

    const commentCount = await Comments.countDocuments({ postId: post.postId, isResolved });
    const commentCountWithoutReplies = await Comments.countDocuments({
      postId: post.postId,
      isResolved,
      parentId: null,
    });

    return res.json({
      commentCount,
      commentCountWithoutReplies,
    });
  });

  app.get('/facebook/get-customer-posts', async (req, res) => {
    debugFacebook(`Request to get customer post data with: ${JSON.stringify(req.query)}`);

    const { customerId } = req.query;

    const customer = await Customers.findOne({ erxesApiId: customerId });

    if (!customer) {
      return res.end();
    }

    const result = await Comments.aggregate([
      { $match: { senderId: customer.userId } },
      { $lookup: { from: 'posts_facebooks', localField: 'postId', foreignField: 'postId', as: 'post' } },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          conversationId: '$post.erxesApiId',
        },
      },
      {
        $project: { _id: 0, conversationId: 1 },
      },
    ]);

    const conversationIds = result.map(conv => conv.conversationId);

    return res.send(conversationIds);
  });

  app.get('/facebook/get-comments', async (req, res) => {
    debugFacebook(`Request to get comments with: ${JSON.stringify(req.query)}`);

    const { postId, commentId, senderId, isResolved } = req.query;

    const post = await Posts.getPost({ erxesApiId: postId });

    const query: { postId: string; isResolved?: boolean; parentId?: string; senderId?: string } = {
      postId: post.postId,
    };

    query.isResolved = isResolved === 'false' ? false : true;

    let { limit } = req.query;

    limit = parseInt(limit, 10);

    if (senderId !== 'undefined') {
      const customer = await Customers.findOne({ erxesApiId: senderId });

      if (!customer) {
        return res.end();
      }
      query.senderId = customer.userId;
    } else {
      query.parentId = commentId !== 'undefined' ? commentId : null;
    }

    const result = await Comments.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'customers_facebooks',
          localField: 'senderId',
          foreignField: 'userId',
          as: 'customer',
        },
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'posts_facebooks',
          localField: 'postId',
          foreignField: 'postId',
          as: 'post',
        },
      },
      {
        $unwind: {
          path: '$post',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'comments_facebooks',
          localField: 'commentId',
          foreignField: 'parentId',
          as: 'replies',
        },
      },
      {
        $addFields: {
          commentCount: { $size: '$replies' },
          'customer.avatar': '$customer.profilePic',
          'customer._id': '$customer.erxesApiId',
          conversationId: '$post.erxesApiId',
        },
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit },
    ]);

    return res.json(result.reverse());
  });

  const accessTokensByPageId = {};

  const getAdapter = async (): Promise<any> => {
    const FACEBOOK_VERIFY_TOKEN = await getConfig('FACEBOOK_VERIFY_TOKEN');
    const FACEBOOK_APP_SECRET = await getConfig('FACEBOOK_APP_SECRET');

    if (!FACEBOOK_VERIFY_TOKEN || !FACEBOOK_APP_SECRET) {
      return debugBase('Invalid facebook config');
    }

    return new FacebookAdapter({
      verify_token: FACEBOOK_VERIFY_TOKEN,
      app_secret: FACEBOOK_APP_SECRET,
      getAccessTokenForPage: async (pageId: string) => {
        return accessTokensByPageId[pageId];
      },
    });
  };

  // Facebook endpoint verifier
  app.get('/facebook/receive', async (req, res) => {
    const FACEBOOK_VERIFY_TOKEN = await getConfig('FACEBOOK_VERIFY_TOKEN');

    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
    if (req.query['hub.mode'] === 'subscribe') {
      if (req.query['hub.verify_token'] === FACEBOOK_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
      } else {
        res.send('OK');
      }
    }
  });

  app.post('/facebook/receive', async (req, res, next) => {
    const data = req.body;

    if (data.object !== 'page') {
      return;
    }

    const adapter = await getAdapter();

    for (const entry of data.entry) {
      // receive chat
      if (entry.messaging) {
        debugFacebook(`Received messenger data ${JSON.stringify(data)}`);

        adapter
          .processActivity(req, res, async context => {
            const { activity } = await context;

            if (!activity) {
              next();
            }

            const pageId = activity.recipient.id;

            const integration = await Integrations.getIntegration({
              $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-messenger' }],
            });

            await Accounts.getAccount({ _id: integration.accountId });

            const { facebookPageTokensMap } = integration;

            try {
              accessTokensByPageId[pageId] = getPageAccessTokenFromMap(pageId, facebookPageTokensMap);
            } catch (e) {
              debugFacebook(`Error occurred while getting page access token: ${e.message}`);
              return next();
            }

            await receiveMessage(activity);

            debugFacebook(`Successfully saved activity ${JSON.stringify(activity)}`);
          })

          .catch(e => {
            debugFacebook(`Error occurred while processing activity: ${e.message}`);
            res.end('success');
          });
      }

      // receive post and comment
      if (entry.changes) {
        for (const event of entry.changes) {
          debugFacebook(`Received post data ${JSON.stringify(event.value)}`);

          if (event.value.item === 'comment') {
            try {
              await receiveComment(event.value, entry.id);
              debugFacebook(`Successfully saved  ${JSON.stringify(event.value)}`);
              res.end('success');
            } catch (e) {
              debugFacebook(`Error processing comment: ${e.message}`);
              res.end('success');
            }
          }

          if (FACEBOOK_POST_TYPES.includes(event.value.item)) {
            try {
              await receivePost(event.value, entry.id);
              debugFacebook(`Successfully saved  ${JSON.stringify(event.value)}`);
              res.end('success');
            } catch (e) {
              debugFacebook(`Error processing comment: ${e.message}`);
              res.end('success');
            }
          } else {
            res.end('success');
          }
        }
      }
    }
  });
};

export default init;
