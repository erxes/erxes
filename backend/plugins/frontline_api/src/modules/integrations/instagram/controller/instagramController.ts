import { IModels } from '~/connectionResolvers';
import { receiveMessage } from './receiveMessage';
import { receiveComment } from './receiveComment';
import { receivePost } from './receivePost';
import { debugInstagram, debugError } from '@/integrations/instagram/debuggers';
import { Activity } from '@/integrations/instagram/@types/utils';

export const instagramWebhookHandler = async (
  models: IModels,
  subdomain: string,
  data: any,
) => {
  debugInstagram(`Received Instagram webhook: ${JSON.stringify(data)}`);

  if (!data.object || data.object !== 'instagram') {
    debugError('Invalid webhook object type');
    return;
  }

  for (const entry of data.entry || []) {
    try {
      await processInstagramEntry(models, subdomain, entry);
    } catch (error) {
      debugError(`Error processing entry: ${error.message}`);
    }
  }
};

const processInstagramEntry = async (
  models: IModels,
  subdomain: string,
  entry: any,
) => {
  const { id: pageId, messaging, changes, standby } = entry;

  if (messaging && Array.isArray(messaging)) {
    for (const messagingEvent of messaging) {
      await processMessagingEvent(models, subdomain, messagingEvent, pageId);
    }
  }

  if (changes && Array.isArray(changes)) {
    for (const change of changes) {
      await processChangeEvent(models, subdomain, change, pageId);
    }
  }

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
  pageId: string,
) => {
  const { sender, recipient, timestamp, message, postback } = messagingEvent;

  if (!sender || !recipient) {
    debugError('Invalid messaging event: missing sender or recipient');
    return;
  }

  if (!message && !postback) {
    debugInstagram(`Skipping delivery/read event for page ${pageId}`);
    return;
  }

  try {
    const integration = await models.InstagramIntegrations.findOne({
      instagramPageId: recipient.id,
    });

    if (!integration) {
      debugError(`No integration found for page ${recipient.id}`);
      return;
    }

    const activity: Activity = {
      channelId: '',
      type: message ? 'message' : 'postback',
      conversation: { id: '' },
      from: sender,
      recipient,
      timestamp: new Date(timestamp),
      text: message?.text || postback?.title || '',
      channelData: {
        sender: { id: sender.id },
        recipient: { id: recipient.id },
        timestamp,
        message,
        postback,
      },
    };

    await receiveMessage(models, subdomain, integration, activity);
  } catch (error) {
    debugError(`Error processing messaging event: ${error.message}`);
  }
};

const processChangeEvent = async (
  models: IModels,
  subdomain: string,
  change: any,
  pageId: string,
) => {
  const { field, value } = change;

  if (field === 'comments') {
    await receiveComment(models, subdomain, value, pageId);
  } else if (field === 'feed') {
    await receivePost(models, subdomain, value, pageId);
  }
};

const processStandbyEvent = async (
  _models: IModels,
  _subdomain: string,
  standbyEvent: any,
) => {
  debugInstagram(`Standby event received: ${JSON.stringify(standbyEvent)}`);
};
