import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { getConfig } from '@/integrations/facebook/commonUtils';
import {
  FACEBOOK_POST_TYPES,
  INTEGRATION_KINDS,
  LOG_TYPES,
} from '@/integrations/facebook/constants';
import { receiveComment } from '@/integrations/facebook/controller/receiveComment';
import {
  getReceiptKind,
  receiveDeliveryStatus,
} from '@/integrations/facebook/controller/receiveDeliveryStatus';
import { receiveMessage } from '@/integrations/facebook/controller/receiveMessage';
import { receivePost } from '@/integrations/facebook/controller/receivePost';
import { debugError, debugFacebook } from '@/integrations/facebook/debuggers';
import {
  checkIsAdsOpenThread,
  getPageAccessTokenFromMap,
} from '@/integrations/facebook/utils';
import { getSubdomain, isDev } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';

export const facebookGetPost = async (req, res, next) => {
  try {
    debugFacebook(
      `Request to get post data with: ${JSON.stringify(req.query)}`,
    );

    const subdomain = getSubdomain(req);
    const models = await generateModels(subdomain);

    const { erxesApiId } = req.query;

    const post = await models.FacebookPostConversations.findOne({ erxesApiId });

    return res.json({ ...post });
  } catch (e) {
    next(e);
  }
};

export const facebookGetStatus = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

const accessTokensByPageId = {};
export const facebookSubscription = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

type TWebhookEventKind =
  | 'messaging'
  | 'standby'
  | 'comment'
  | 'post'
  | 'delivery'
  | 'read'
  | 'unhandled';

const logWebhookEvent = async (
  models: IModels,
  {
    kind,
    pageId,
    identifier,
    count,
    error,
  }: {
    kind: TWebhookEventKind;
    pageId: string;
    identifier?: string;
    count?: number;
    error?: string;
  },
) => {
  // Meta stops retrying once we ack, so a dropped event is only visible here.
  try {
    await models.FacebookLogs.createLog({
      type: error ? LOG_TYPES.ERROR : LOG_TYPES.SUCCESS,
      value: {
        action: 'facebook-webhook-event',
        kind,
        pageId,
        identifier,
        count,
        error: (error || '').slice(0, 500) || undefined,
      },
      specialValue: pageId,
    });
  } catch (e) {
    debugError(`Failed to log webhook event: ${(e as Error).message}`);
  }
};

const processChangeEvent = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  event: any,
) => {
  const value = event?.value;

  if (!value) {
    return;
  }

  const isComment = value.item === 'comment';
  const isPost = FACEBOOK_POST_TYPES.includes(value.item);

  if (!isComment && !isPost) {
    debugFacebook(`Unhandled change item: ${value.item}`);
    await logWebhookEvent(models, {
      kind: 'unhandled',
      pageId,
      identifier: value.item,
    });
    return;
  }

  const kind: TWebhookEventKind = isComment ? 'comment' : 'post';
  const identifier = isComment ? value.comment_id : value.post_id;

  try {
    if (isComment) {
      await receiveComment(models, subdomain, value, pageId);
    } else {
      await receivePost(models, subdomain, value, pageId);
    }

    await logWebhookEvent(models, { kind, pageId, identifier });
  } catch (e) {
    debugError(`Error processing ${kind}: ${(e as Error).message}`);
    await logWebhookEvent(models, {
      kind,
      pageId,
      identifier,
      error: (e as Error).message,
    });
  }
};

const processEntry = async (models: IModels, subdomain: string, entry: any) => {
  if (entry.messaging) {
    try {
      await processMessagingEvent(
        entry,
        models,
        subdomain,
        accessTokensByPageId,
      );
      await logWebhookEvent(models, { kind: 'messaging', pageId: entry.id });
    } catch (e) {
      await logWebhookEvent(models, {
        kind: 'messaging',
        pageId: entry.id,
        error: (e as Error).message,
      });
    }
  }

  if (entry.standby) {
    try {
      // A secondary receiver gets receipts here, not on the messaging channel.
      for (const standbyEvent of Array.isArray(entry.standby)
        ? entry.standby
        : []) {
        const receiptKind = getReceiptKind(standbyEvent);

        if (!receiptKind) {
          continue;
        }

        const count = await receiveDeliveryStatus(
          models,
          standbyEvent,
          receiptKind,
        );

        await logWebhookEvent(models, {
          kind: receiptKind,
          pageId: entry.id,
          count,
        });
      }

      const activities = await processStandbyEvents(entry, models);

      for (const { activity, integration } of activities) {
        try {
          await receiveMessage(models, subdomain, integration, activity);
          await logWebhookEvent(models, { kind: 'standby', pageId: entry.id });
        } catch (e) {
          await logWebhookEvent(models, {
            kind: 'standby',
            pageId: entry.id,
            error: (e as Error).message,
          });
        }
      }
    } catch (e) {
      await logWebhookEvent(models, {
        kind: 'standby',
        pageId: entry.id,
        error: (e as Error).message,
      });
    }
  }

  // Meta batches up to 1000 updates per delivery; every change must be drained.
  for (const event of entry.changes || []) {
    await processChangeEvent(models, subdomain, entry.id, event);
  }
};

export const facebookWebhook = async (req, res) => {
  const data = req.body;

  // Meta requires 200 OK within 5s, else the page is unsubscribed after 1h.
  res.status(200).send('EVENT_RECEIVED');

  if (data?.object !== 'page' && !checkIsAdsOpenThread(data?.entry)) {
    debugFacebook(`Ignored non-page webhook object: ${data?.object}`);
    return;
  }

  // Response is already sent; throwing here would make routes.ts write twice.
  try {
    const subdomain = isDev ? 'localhost' : getSubdomain(req);
    const models = await generateModels(subdomain);

    for (const entry of data.entry || []) {
      await processEntry(models, subdomain, entry);
    }
  } catch (e) {
    debugError(`Failed to process facebook webhook: ${(e as Error).message}`);
  }
};

export async function processMessagingEvent(
  entry: any,
  models: IModels,
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
      return;
    }

    for (const activity of messagingEvents) {
      if (!activity?.recipient?.id) {
        debugFacebook('Skipping activity with missing recipient ID.');
        continue;
      }

      const pageId = activity.recipient.id;
      const receiptKind = getReceiptKind(activity);

      // A receipt carries no message; it must never reach receiveMessage.
      if (receiptKind) {
        const count = await receiveDeliveryStatus(
          models,
          activity,
          receiptKind,
        );

        await logWebhookEvent(models, { kind: receiptKind, pageId, count });
        continue;
      }

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
    debugError(`Failed to process messaging event: ${(e as Error).message}`);
    throw e;
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

      // Secondary receivers also get receipts on the standby channel.
      if (getReceiptKind(standbyEvent)) {
        continue;
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
