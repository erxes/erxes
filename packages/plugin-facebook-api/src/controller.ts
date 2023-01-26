import { getSubdomain } from '@erxes/api-utils/src/core';

import { debugError, debugFacebook } from './debuggers';
import { getConfig } from './commonUtils';
import loginMiddleware from './middlewares/loginMiddleware';
import receiveComment from './receiveComment';
import receiveMessage from './receiveMessage';
import receivePost from './receivePost';
import { FACEBOOK_POST_TYPES, INTEGRATION_KINDS } from './constants';
import { getAdapter, getPageAccessTokenFromMap } from './utils';
import { generateModels } from './connectionResolver';

const init = async app => {
  app.get('/fblogin', loginMiddleware);

  app.get('/facebook/get-post', async (req, res) => {
    debugFacebook(
      `Request to get post data with: ${JSON.stringify(req.query)}`
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.Posts.getPost({ erxesApiId }, true);

    return res.json({ ...post });
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
                { kind: INTEGRATION_KINDS.MESSENGER }
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
            return res.end('success');
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
              return res.end('success');
            } catch (e) {
              debugError(`Error processing comment: ${e.message}`);
              return res.end('success');
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
              return res.end('success');
            } catch (e) {
              debugError(`Error processing comment: ${e.message}`);
              return res.end('success');
            }
          } else {
            return res.end('success');
          }
        }
      }
    }
  });
};

export default init;
