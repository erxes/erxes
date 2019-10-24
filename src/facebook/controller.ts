import { FacebookAdapter } from 'botbuilder-adapter-facebook';
import { debugBase, debugFacebook, debugRequest, debugResponse } from '../debuggers';
import Accounts from '../models/Accounts';
import Integrations from '../models/Integrations';
import { getEnv, sendRequest } from '../utils';
import loginMiddleware from './loginMiddleware';
import { Comments, Conversations, Posts } from './models';
import receiveComment from './receiveComment';
import receiveMessage from './receiveMessage';
import receivePost from './receivePost';

import { FACEBOOK_POST_TYPES } from './constants';
import {
  generateAttachmentMessages,
  getPageAccessToken,
  getPageAccessTokenFromMap,
  getPageList,
  sendReply,
  subscribePage,
} from './utils';

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
          url: ENDPOINT_URL,
          method: 'POST',
          body: {
            domain: DOMAIN,
            facebookPageIds,
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

  app.post('/facebook/reply', async (req, res, next) => {
    debugRequest(debugFacebook, req);

    const { integrationId, conversationId, content, attachments } = req.body;

    const conversation = await Conversations.getConversation({ erxesApiId: conversationId });

    const { recipientId, senderId } = conversation;

    try {
      if (content) {
        const response = await sendReply(
          'me/messages',
          { recipient: { id: senderId }, message: { text: content } },
          recipientId,
          integrationId,
        );

        return res.json(response);
      }

      for (const message of generateAttachmentMessages(attachments)) {
        await sendReply('me/messages', { recipient: { id: senderId }, message }, recipientId, integrationId);
      }

      return res.json({ status: 'success' });
    } catch (e) {
      return next(new Error(e));
    }
  });

  app.post('/facebook/reply-post', async (req, res, next) => {
    debugRequest(debugFacebook, req);

    const { integrationId, conversationId, content, attachments } = req.body;

    const comment = await Comments.findOne({ commentId: conversationId });

    const post = await Posts.findOne({
      $or: [{ erxesApiId: conversationId }, { postId: comment ? comment.postId : '' }],
    });

    const { recipientId } = post;

    let attachment: { url?: string; type?: string; payload?: { url: string } } = {};

    if (attachments && attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: {
          url: attachments[0].url,
        },
      };
    }

    const data = {
      message: content,
      attachment_url: attachment.url,
    };

    const id = comment ? comment.commentId : post.postId;

    try {
      const response = await sendReply(`${id}/comments`, data, recipientId, integrationId);
      res.json(response);
    } catch (e) {
      return next(new Error(e));
    }
  });

  const { FACEBOOK_VERIFY_TOKEN, FACEBOOK_APP_SECRET } = process.env;

  if (!FACEBOOK_VERIFY_TOKEN || !FACEBOOK_APP_SECRET) {
    return debugBase('Invalid facebook config');
  }

  const accessTokensByPageId = {};

  const adapter = new FacebookAdapter({
    verify_token: FACEBOOK_VERIFY_TOKEN,
    app_secret: FACEBOOK_APP_SECRET,
    getAccessTokenForPage: async (pageId: string) => {
      return accessTokensByPageId[pageId];
    },
  });

  // Facebook endpoint verifier
  app.get('/facebook/receive', (req, res) => {
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

    debugFacebook(`Received webhook data ${JSON.stringify(data)}`);

    for (const entry of data.entry) {
      // receive chat
      if (entry.messaging) {
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
            next();
          });
      }

      // receive post and comment
      if (entry.changes) {
        for (const event of entry.changes) {
          if (event.value.item === 'comment') {
            try {
              await receiveComment(event.value, entry.id);
              res.end('success');
            } catch (e) {
              return next(new Error(e));
            }
          }

          if (FACEBOOK_POST_TYPES.includes(event.value.item)) {
            try {
              await receivePost(event.value, entry.id);
              res.end('success');
            } catch (e) {
              return next(new Error(e));
            }
          } else {
            res.end('success');
          }

          debugFacebook(`Successfully saved  ${JSON.stringify(event.value)}`);
        }
      }
    }
  });

  app.get('/facebook/get-post', async (req, res) => {
    const { erxesApiId, integrationId } = req.query;

    debugFacebook(`Request to get postData with: ${erxesApiId}`);

    await Integrations.getIntegration({ erxesApiId: integrationId });

    const post = await Posts.getPost({ erxesApiId }, true);

    const commentCount = await Comments.countDocuments({
      $and: [{ postId: post.postId }, { parentId: null }],
    });

    return res.json({
      ...post,
      commentCount,
    });
  });

  app.get('/facebook/get-comments', async (req, res) => {
    const { postId, commentId } = req.query;

    let { limit } = req.query;

    limit = parseInt(limit, 10);

    debugFacebook(`Request to get comments with: ${postId}`);

    const query: { postId: string; parentId?: string } = { postId };

    if (commentId !== 'undefined') {
      query.parentId = commentId;
      limit = 9999;
    } else {
      query.parentId = null;
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
          conversationId: '$post.erxesApiId',
        },
      },

      { $sort: { timestamp: -1 } },
      { $limit: limit },
    ]);

    return res.json(result.reverse());
  });
};

export default init;
