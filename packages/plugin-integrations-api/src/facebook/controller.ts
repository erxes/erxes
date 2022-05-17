import { FacebookAdapter } from 'botbuilder-adapter-facebook-erxes';
import { debugBase, debugError, debugFacebook } from '../debuggers';
import { getConfig, getEnv, sendRequest } from '../utils';
import loginMiddleware from './loginMiddleware';
import receiveComment from './receiveComment';
import receiveMessage from './receiveMessage';
import receivePost from './receivePost';

import { FACEBOOK_POST_TYPES } from './constants';
import {
  getPageAccessToken,
  getPageAccessTokenFromMap,
  subscribePage
} from './utils';
import { generateModels, IModels } from '../connectionResolver';
import { getSubdomain } from '@erxes/api-utils/src/core';

export const facebookCreateIntegration = async (
  models: IModels,
  { accountId, integrationId, data, kind }
) => {
  const facebookPageIds = JSON.parse(data).pageIds;

  const account = await models.Accounts.getAccount({ _id: accountId });

  const integration = await models.Integrations.create({
    kind,
    accountId,
    erxesApiId: integrationId,
    facebookPageIds
  });

  const ENDPOINT_URL = getEnv({ name: 'ENDPOINT_URL' });
  const DOMAIN = getEnv({ name: 'DOMAIN' });

  if (ENDPOINT_URL) {
    // send domain to core endpoints
    try {
      await sendRequest({
        url: `${ENDPOINT_URL}/register-endpoint`,
        method: 'POST',
        body: {
          domain: `${DOMAIN}/gateway/pl:integrations`,
          facebookPageIds,
          fbPageIds: facebookPageIds
        }
      });
    } catch (e) {
      await models.Integrations.deleteOne({ _id: integration._id });
      throw e;
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
        debugError(
          `Error ocurred while trying to subscribe page ${e.message || e}`
        );
        throw e;
      }
    } catch (e) {
      debugError(
        `Error ocurred while trying to get page access token with ${e.message ||
          e}`
      );

      throw e;
    }
  }

  integration.facebookPageTokensMap = facebookPageTokensMap;

  await integration.save();

  return { status: 'success' };
};

export const facebookGetCustomerPosts = async (
  models: IModels,
  { customerId }
) => {
  const customer = await models.FbCustomers.findOne({ erxesApiId: customerId });

  if (!customer) {
    return null;
  }

  const result = await models.FbComments.aggregate([
    { $match: { senderId: customer.userId } },
    {
      $lookup: {
        from: 'posts_facebooks',
        localField: 'postId',
        foreignField: 'postId',
        as: 'post'
      }
    },
    {
      $unwind: {
        path: '$post',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $addFields: {
        conversationId: '$post.erxesApiId'
      }
    },
    {
      $project: { _id: 0, conversationId: 1 }
    }
  ]);

  const conversationIds = result.map(conv => conv.conversationId);

  return conversationIds;
};

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.get('/facebook/get-post', async (req, res) => {
    debugFacebook(
      `Request to get post data with: ${JSON.stringify(req.query)}`
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.FbPosts.getPost({ erxesApiId }, true);

    return res.json({
      ...post
    });
  });

  app.get('/facebook/get-status', async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { integrationId } = req.query;

    const integration = await models.Integrations.findOne({
      erxesApiId: integrationId
    });

    let result = {
      status: 'healthy'
    } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || 'healthy',
        error: integration.error
      };
    }

    return res.send(result);
  });

  const accessTokensByPageId = {};

  const getAdapter = async (models: IModels): Promise<any> => {
    const FACEBOOK_VERIFY_TOKEN = await getConfig(
      models,
      'FACEBOOK_VERIFY_TOKEN'
    );
    const FACEBOOK_APP_SECRET = await getConfig(models, 'FACEBOOK_APP_SECRET');

    if (!FACEBOOK_VERIFY_TOKEN || !FACEBOOK_APP_SECRET) {
      return debugBase('Invalid facebook config');
    }

    return new FacebookAdapter({
      verify_token: FACEBOOK_VERIFY_TOKEN,
      app_secret: FACEBOOK_APP_SECRET,
      getAccessTokenForPage: async (pageId: string) => {
        return accessTokensByPageId[pageId];
      }
    });
  };

  // Facebook endpoint verifier
  app.get('/facebook/receive', async (req, res) => {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const FACEBOOK_VERIFY_TOKEN = await getConfig(
      models,
      'FACEBOOK_VERIFY_TOKEN'
    );

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
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const data = req.body;

    if (data.object !== 'page') {
      return;
    }

    const adapter = await getAdapter(models);

    for (const entry of data.entry) {
      // receive chat
      if (entry.messaging) {
        debugFacebook(`Received messenger data ${JSON.stringify(data)}`);

        adapter
          .processActivity(req, res, async context => {
            const { activity } = await context;

            if (!activity || !activity.recipient) {
              next();
            }

            const pageId = activity.recipient.id;

            const integration = await models.Integrations.getIntegration({
              $and: [
                { facebookPageIds: { $in: pageId } },
                { kind: 'facebook-messenger' }
              ]
            });

            await models.Accounts.getAccount({ _id: integration.accountId });

            const { facebookPageTokensMap = {} } = integration;

            try {
              accessTokensByPageId[pageId] = getPageAccessTokenFromMap(
                pageId,
                facebookPageTokensMap
              );
            } catch (e) {
              debugFacebook(
                `Error occurred while getting page access token: ${e.message}`
              );
              return next();
            }

            await receiveMessage(models, subdomain, activity);

            debugFacebook(
              `Successfully saved activity ${JSON.stringify(activity)}`
            );
          })

          .catch(e => {
            debugFacebook(
              `Error occurred while processing activity: ${e.message}`
            );
            res.end('success');
          });
      }

      // receive post and comment
      if (entry.changes) {
        for (const event of entry.changes) {
          if (event.value.item === 'comment') {
            debugFacebook(
              `Received comment data ${JSON.stringify(event.value)}`
            );
            try {
              await receiveComment(models, subdomain, event.value, entry.id);
              debugFacebook(
                `Successfully saved  ${JSON.stringify(event.value)}`
              );
              res.end('success');
            } catch (e) {
              debugError(`Error processing comment: ${e.message}`);
              res.end('success');
            }
          }

          if (FACEBOOK_POST_TYPES.includes(event.value.item)) {
            try {
              debugFacebook(
                `Received post data ${JSON.stringify(event.value)}`
              );
              await receivePost(models, subdomain, event.value, entry.id);
              debugFacebook(
                `Successfully saved post ${JSON.stringify(event.value)}`
              );
              res.end('success');
            } catch (e) {
              debugError(`Error processing comment: ${e.message}`);
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
