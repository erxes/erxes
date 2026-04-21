import { getConfig } from '@/integrations/instagram/commonUtils';
import { receiveComment } from '@/integrations/instagram/controller/receiveComment';
import { receiveMessage } from '@/integrations/instagram/controller/receiveMessage';
import { debugError, debugInstagram } from '@/integrations/instagram/debuggers';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { NextFunction, Response } from 'express';
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
  if (data.object !== 'instagram') {
    return;
  }
  for (const entry of data.entry) {
    // receive direct messages
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
          return res.send('success');
        } catch (e) {
          return res.send('error ' + e);
        }
      }
    } else if (entry.standby) {
      // Handle standby data if entry.messaging does not exist
      const standbyData = entry.standby;
      if (standbyData && standbyData.length > 0) {
        try {
          // Process each item in standbyData
          for (const data of standbyData) {
            const integration = await models.InstagramIntegrations.findOne({
              instagramPageId: data.recipient?.id,
            });
            if (!integration) continue;
            await receiveMessage(models, subdomain, integration, data);
          }
          return res.send('success');
        } catch (e) {
          return res.send('error ' + e);
        }
      } else {
        return res.send('no standby data'); // Handle case when standbyData is empty
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
            debugInstagram(
              `Successfully saved  ${JSON.stringify(event.value)}`,
            );
            return res.end('success');
          } catch (e) {
            debugError(`Error processing comment: ${e.message}`);
            return res.end('success');
          }
        }
      }
    }
  }
};
