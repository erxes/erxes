import { generateModels, IModels } from '~/connectionResolvers';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { debugFacebook, debugError } from '@/integrations/facebook/debuggers';
import { checkIsAdsOpenThread } from '@/integrations/facebook/utils';
import { NextFunction, Response } from 'express';
import {
  INTEGRATION_KINDS,
  FACEBOOK_POST_TYPES,
} from '@/integrations/facebook/constants';
import { getPageAccessTokenFromMap } from '@/integrations/facebook/utils';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { receiveMessage } from '@/integrations/facebook/controller/receiveMessage';
import { getConfig } from '@/integrations/facebook/commonUtils';
import { Activity } from '@/integrations/facebook/@types/utils';
import { receiveComment } from '@/integrations/facebook/controller/receiveComment';
import { receivePost } from '@/integrations/facebook/controller/receivePost';
export const facebookGetPost = async (req, res) => {
  debugFacebook(`Request to get post data with: ${JSON.stringify(req.query)}`);

  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { erxesApiId } = req.query;

  const post = await models.FacebookPostConversations.findOne({ erxesApiId });

  return res.json({ ...post });
};

export const facebookGetStatus = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const { integrationId } = req.query;

  const integration = await models.FacebookIntegrations.findOne({
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
};

const accessTokensByPageId = {};
export const facebookSubscription = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const FACEBOOK_VERIFY_TOKEN = await getConfig(
    models,
    'FACEBOOK_VERIFY_TOKEN',
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
};
export const facebookWebhook = async (req, res, next) => {
  const subdomain = isDev ? 'localhost' : getSubdomain(req);

  debugFacebook(`Received webhook request for subdomain: ${subdomain}`);

  const models = await generateModels(subdomain);
  const data = req.body;
  if (data.object !== 'page' && !checkIsAdsOpenThread(data?.entry)) {
    return;
  }
  for (const entry of data.entry) {
    console.log('entry =', JSON.stringify(entry, null, 2));
    // receive chat
    try {
      if (entry.messaging) {
        await processMessagingEvent(
          entry,
          models,
          res,
          next,
          subdomain,
          accessTokensByPageId,
        );
      }
      if (entry.standby) {
        const activities = await processStandbyEvents(entry, models);
        for (const { activity, integration } of activities) {
          await receiveMessage(models, subdomain, integration, activity);
        }
      }
    } catch (error) {
      debugFacebook(`Error processing entry: ${error.message}`);
      // Optionally, send a response or log the error
      res.status(500).send('Internal Server Error');
    }

    // receive post and comment
    if (entry.changes) {
      for (const event of entry.changes) {
        if (event.value.item === 'comment') {
          debugFacebook(`Received comment data ${JSON.stringify(event.value)}`);
          try {
            await receiveComment(models, subdomain, event.value, entry.id);
            debugFacebook(`Successfully saved  ${JSON.stringify(event.value)}`);
            return res.end('success');
          } catch (e) {
            debugError(`Error processing comment: ${e.message}`);
            return res.end('success');
          }
        }

        if (FACEBOOK_POST_TYPES.includes(event.value.item)) {
          try {
            debugFacebook(`Received post data ${JSON.stringify(event.value)}`);
            await receivePost(models, subdomain, event.value, entry.id);
            debugFacebook(
              `Successfully saved post ${JSON.stringify(event.value)}`,
            );
            return res.end('success');
          } catch (e) {
            debugError(`Error processing post: ${e.message}`);
            return res.end('success');
          }
        } else {
          return res.end('success');
        }
      }
    }
  }
};

export async function processMessagingEvent(
  entry: any,
  models: IModels,
  res: Response,
  next: NextFunction,
  subdomain: string,
  accessTokensByPageId: Record<string, string>,
) {
  debugFacebook(`Received messenger data: ${JSON.stringify(entry)}`);

  try {
    const messagingEvents = Array.isArray(entry.messaging)
      ? entry.messaging
      : [];

    if (messagingEvents.length === 0) {
      debugFacebook('No messaging events found in entry.');
      return; // Just return, do not call next here — next only for middleware chains
    }

    for (const activity of messagingEvents) {
      if (!activity?.recipient?.id) {
        debugFacebook('Skipping activity with missing recipient ID.');
        continue;
      }

      const pageId = activity.recipient.id;

      // Find the related Facebook integration
      const integration = await models.FacebookIntegrations.getIntegration({
        $and: [
          { facebookPageIds: { $in: [pageId] } },
          { kind: INTEGRATION_KINDS.MESSENGER },
        ],
      });

      if (!integration) {
        debugFacebook(`No integration found for pageId: ${pageId}`);
        continue;
      }

      const facebookAccounts = await models.FacebookAccounts.getAccount({
        _id: integration.accountId,
      });

      if (!facebookAccounts) {
        debugFacebook(
          `No Facebook account found for accountId: ${integration.accountId}`,
        );
        continue;
      }

      const { facebookPageTokensMap = {} } = integration;
      try {
        accessTokensByPageId[pageId] = getPageAccessTokenFromMap(
          pageId,
          facebookPageTokensMap,
        );
      } catch (e) {
        debugFacebook(`Error getting page access token: ${e.message}`);
        continue;
      }

      const activityData = {
        channelId: 'facebook',
        timestamp: new Date(activity.timestamp),
        conversation: {
          id: activity.sender?.id || '',
        },
        from: {
          id: activity.sender?.id || '',
          name: activity.sender?.name || activity.sender?.id || '',
        },
        recipient: {
          id: activity.recipient?.id || '',
          name: activity.recipient?.name || activity.recipient?.id || '',
        },
        channelData: activity,
        type: 'message',
        text: activity.message?.text || '',
      };
      debugFacebook(`Processing activity: ${JSON.stringify(activityData)}`);

      await receiveMessage(models, subdomain, integration, activityData);
    }
  } catch (e) {
    debugFacebook(`Failed to process messaging event: ${(e as Error).message}`);
  }
}

export async function processStandbyEvents(data: any, models: IModels) {
  const activities: {
    activity: any;
    integration: IFacebookIntegrationDocument;
  }[] = [];
  if (!data.standby || !Array.isArray(data.standby)) {
    debugFacebook('No standby events found or standby is not an array');
    return activities;
  }
  for (const standbyEvent of data.standby) {
    try {
      if (
        !standbyEvent.recipient?.id ||
        !standbyEvent.sender?.id ||
        !standbyEvent.timestamp
      ) {
        debugFacebook('Invalid standby event: missing required fields');
        continue; // Skip invalid event
      }

      const integration = await models.FacebookIntegrations.getIntegration({
        $and: [
          { facebookPageIds: { $in: [standbyEvent.recipient.id] } },
          { kind: INTEGRATION_KINDS.MESSENGER },
        ],
      });

      if (!integration) {
        debugFacebook(
          `Integration not found for pageId: ${standbyEvent.recipient.id}`,
        );
        continue;
      }

      const activity: any = {
        channelId: 'facebook',
        timestamp: new Date(standbyEvent.timestamp),
        conversation: {
          id: standbyEvent.sender.id,
        },
        from: {
          id: standbyEvent.sender.id,
          name: standbyEvent.sender.id,
        },
        recipient: {
          id: standbyEvent.recipient.id,
          name: standbyEvent.recipient.id,
        },
        channelData: standbyEvent,
        type: 'message',
        text: standbyEvent.message?.text || '',
      };

      activities.push({ activity, integration });
    } catch (error) {
      debugFacebook(`Error processing standby event: ${error.message}`);
    }
  }

  return activities;
}
