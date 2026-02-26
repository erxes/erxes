import { IModels } from '~/connectionResolvers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { getConfig } from '@/integrations/instagram/utils';
import { receiveMessage } from './receiveMessage';
import { receiveComment } from './receiveComment';
import { receivePost } from './receivePost';
import { debugInstagram, debugInstagramError } from '@/integrations/instagram/debuggers';
import { 
  INSTAGRAM_WEBHOOK_EVENTS,
  INSTAGRAM_MESSAGE_TYPES 
} from '@/integrations/instagram/constants';

export const instagramWebhookHandler = async (
  models: IModels,
  subdomain: string,
  data: any,
) => {
  debugInstagram(`Received Instagram webhook: ${JSON.stringify(data)}`);

  if (!data.object || data.object !== 'instagram') {
    debugInstagramError('Invalid webhook object type');
    return;
  }

  const entries = data.entry || [];

  for (const entry of entries) {
    try {
      await processInstagramEntry(models, subdomain, entry);
    } catch (error) {
      debugInstagramError(`Error processing entry: ${error.message}`, error);
    }
  }
};

const processInstagramEntry = async (
  models: IModels,
  subdomain: string,
  entry: any,
) => {
  const { id, messaging, changes, standby } = entry;

  // Handle direct messages
  if (messaging && Array.isArray(messaging)) {
    for (const messagingEvent of messaging) {
      await processMessagingEvent(models, subdomain, messagingEvent);
    }
  }

  // Handle comment changes
  if (changes && Array.isArray(changes)) {
    for (const change of changes) {
      await processChangeEvent(models, subdomain, change);
    }
  }

  // Handle standby events
  if (standby && Array.isArray(standby)) {
    for (const standbyEvent of standby) {
      await processStandbyEvent(models, subdomain, standbyEvent);
    }
  }
};

const processMessagingEvent = async (
  models: IModels,
  subdomain: string,
  messagingEvent: any,
) => {
  const { sender, recipient, timestamp, message, postback, delivery, read } = messagingEvent;

  if (!sender || !recipient) {
    debugInstagramError('Invalid messaging event: missing sender or recipient');
    return;
  }

  const pageId = recipient.id;
  const userId = sender.id;

  try {
    const integration = await getConfig(models, pageId);

    const activity = {
      from: sender,
      recipient: recipient,
      timestamp: new Date(timestamp),
      text: message?.text || postback?.title || '',
      channelData: {
        message,
        postback,
        delivery,
        read,
      },
    };

    if (message) {
      await receiveMessage(models, subdomain, integration, activity);
    } else if (postback) {
      await receiveMessage(models, subdomain, integration, activity);
    } else if (delivery) {
      // Handle delivery confirmation
      debugInstagram(`Message delivered to ${userId}`);
    } else if (read) {
      // Handle read confirmation
      debugInstagram(`Message read by ${userId}`);
    }
  } catch (error) {
    debugInstagramError(`Error processing messaging event: ${error.message}`, error);
  }
};

const processChangeEvent = async (
  models: IModels,
  subdomain: string,
  change: any,
) => {
  const { field, value } = change;

  if (field === 'comments') {
    // Handle comment changes
    await receiveComment(models, subdomain, change);
  } else if (field === 'feed') {
    // Handle post changes
    await receivePost(models, subdomain, change);
  }
};

const processStandbyEvent = async (
  models: IModels,
  subdomain: string,
  standbyEvent: any,
) => {
  // Handle standby events for thread subscription
  debugInstagram(`Standby event received: ${JSON.stringify(standbyEvent)}`);
};

export const instagramGetStatus = async (req, res, next) => {
  try {
    const subdomain = req.getSubdomain();
    const models = await req.generateModels(subdomain);

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

    return res.json(result);
  } catch (e) {
    next(e);
  }
};

export const instagramGetPost = async (req, res, next) => {
  try {
    debugInstagram(`Request to get Instagram post data with: ${JSON.stringify(req.query)}`);

    const subdomain = req.getSubdomain();
    const models = await req.generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.InstagramPostConversations.findOne({ erxesApiId });

    return res.json({ ...post });
  } catch (e) {
    next(e);
  }
};
