import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { getConfig } from '@/integrations/instagram/commonUtils';
import {
  INSTAGRAM_POST_TYPES,
  INTEGRATION_KINDS,
} from '@/integrations/instagram/constants';
import { receiveComment } from '@/integrations/instagram/controller/receiveComment';
import { receiveMessage } from '@/integrations/instagram/controller/receiveMessage';
import { receivePost } from '@/integrations/instagram/controller/receivePost';
import { debugError, debugInstagram } from '@/integrations/instagram/debuggers';
import { getPageAccessTokenFromMap } from '@/integrations/instagram/utils';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { NextFunction, Response } from 'express';
import { generateModels, IModels } from '~/connectionResolvers';

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

const accessTokensByPageId = {};
export const instagramSubscription = async (req, res, next) => {
  try {
    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const INSTAGRAM_VERIFY_TOKEN = await getConfig(
      models,
      'INSTAGRAM_VERIFY_TOKEN',
    );

    // when the endpoint is registered as a webhook, it must echo back
    // the 'hub.challenge' value it receives in the query arguments
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
export const instagramWebhook = async (req, res, next) => {
  const subdomain = isDev ? 'localhost' : getSubdomain(req);

  debugInstagram(`Received webhook request for subdomain: ${subdomain}`);
  const models = await generateModels(subdomain);
  const data = req.body;
  if (data.object !== 'instagram') {
    return;
  }
  for (const entry of data.entry) {
    // receive chat
    if (entry.messaging) {
      const messageData = entry.messaging[0];
      if (messageData) {
        try {
          await receiveMessage(models, subdomain, messageData);
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
            await receiveMessage(models, subdomain, data); // Pass the current item
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
