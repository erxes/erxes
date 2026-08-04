import { getConfig } from '@/integrations/instagram/commonUtils';
import { receiveComment } from '@/integrations/instagram/controller/receiveComment';
import { receiveMessage } from '@/integrations/instagram/controller/receiveMessage';
import { debugError, debugInstagram } from '@/integrations/instagram/debuggers';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const instagramGetPost = async (req, res, next) => {
  try {
    debugInstagram(
      `Request to get post data with: ${JSON.stringify(req.query)}`,
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.InstagramPostConversations.findOne({
      erxesApiId,
    });

    return res.json({ ...post });
  } catch (e) {
    next(e);
  }
};

export const instagramGetStatus = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { integrationId } = req.query;

    const integration = await models.InstagramIntegrations.findOne({
      erxesApiId: integrationId,
    });

    let result = {
      status: 'healthy',
    } as any;

    if (integration) {
      result = {
        status: integration.healthStatus || 'healthy',
        error: integration.error,
      };
    }

    return res.send(result);
  } catch (e) {
    next(e);
  }
};

export const instagramSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const INSTAGRAM_VERIFY_TOKEN = await getConfig(
      models,
      'INSTAGRAM_VERIFY_TOKEN',
    );
    if (req.query['hub.mode'] === 'subscribe') {
      if (req.query['hub.verify_token'] === INSTAGRAM_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge']);
      } else {
        res.send('OK');
      }
    }
  } catch (e) {
    next(e);
  }
};
export const instagramWebhook = async (req, res) => {
  const subdomain = isDev ? 'localhost' : getSubdomain(req);

  debugInstagram(`Received webhook request for subdomain: ${subdomain}`);
  const models = await generateModels(subdomain);
  const data = req.body;
  debugInstagram('Received webhook data:' + JSON.stringify(data));

  if (data.object !== 'instagram') {
    return res.send('OK');
  }

  for (const entry of data.entry) {
    if (entry.messaging) {
      const messageData = entry.messaging[0];
      if (messageData) {
        try {
          const integration = await models.InstagramIntegrations.findOne({
            instagramPageId: messageData.recipient?.id,
          });
          if (integration) {
            await receiveMessage(models, subdomain, integration, messageData);
          }
        } catch (e) {
          debugError(`Error processing message: ${e.message}`);
        }
      }
    } else if (entry.standby) {
      const standbyData = entry.standby;
      for (const item of standbyData || []) {
        try {
          const integration = await models.InstagramIntegrations.findOne({
            instagramPageId: item.recipient?.id,
          });
          if (!integration) continue;
          await receiveMessage(models, subdomain, integration, item);
        } catch (e) {
          debugError(`Error processing standby: ${e.message}`);
        }
      }
    }

    if (entry.changes) {
      for (const event of entry.changes) {
        if (event.field === 'comments') {
          debugInstagram(
            `Received comment data ${JSON.stringify(event.value)}`,
          );
          try {
            await receiveComment(models, subdomain, event.value, entry.id);
            debugInstagram(`Successfully saved ${JSON.stringify(event.value)}`);
          } catch (e) {
            debugError(`Error processing comment: ${e.message}`);
          }
        }
      }
    }
  }

  return res.send('success');
};
