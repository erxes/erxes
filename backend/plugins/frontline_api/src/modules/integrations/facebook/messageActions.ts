import { IAttachment, IAttachmentMessage } from './@types/utils';
import { generateAttachmentUrl } from './commonUtils';
import { debugError, debugFacebook } from './debuggers';
import { FacebookSendError } from './errors';
import { IModels } from '~/connectionResolvers';
import { graphRequest, getPageAccessTokenFromMap } from './graphRequest';

// Meta retired the CONFIRMED_EVENT_UPDATE, POST_PURCHASE_UPDATE and
// ACCOUNT_UPDATE message tags on 2026-04-27; the Send API rejects them with
// error 100 "Invalid parameter". HUMAN_AGENT is the only tag still valid for
// replies outside the 24-hour window (up to 7 days after the customer's last
// message).
const DEPRECATED_MESSENGER_TAGS = [
  'CONFIRMED_EVENT_UPDATE',
  'POST_PURCHASE_UPDATE',
  'ACCOUNT_UPDATE',
];

export const HUMAN_AGENT_MESSENGER_TAG = 'HUMAN_AGENT';

export const normalizeMessengerTag = (
  tag?: string | null,
): string | undefined => {
  const trimmed = tag?.trim();
  if (!trimmed) {
    return undefined;
  }
  return DEPRECATED_MESSENGER_TAGS.includes(trimmed)
    ? HUMAN_AGENT_MESSENGER_TAG
    : trimmed;
};

interface IFacebookReplyPayload {
  recipient?: { id?: string; comment_id?: string };
  sender_action?: string;
  tag?: string;
  [key: string]: unknown;
}

export const sendReply = async (
  models: IModels,
  url: string,
  data: IFacebookReplyPayload,
  recipientId: string,
  integrationId: string | undefined,
) => {
  if (!integrationId) {
    throw new Error('integrationId is required');
  }
  const integration = await models.FacebookIntegrations.getIntegration({
    erxesApiId: integrationId,
  });

  const { facebookPageTokensMap = {} } = integration;

  let pageAccessToken;

  try {
    pageAccessToken = getPageAccessTokenFromMap(
      recipientId,
      facebookPageTokensMap,
    );
  } catch (e) {
    debugError(
      `Error occurred while trying to get page access token with ${e.message}`,
    );
    throw new Error(e.message);
  }

  const normalizedTag = normalizeMessengerTag(data?.tag);
  const requestData = data?.tag ? { ...data, tag: normalizedTag } : data;

  try {
    const response = await graphRequest.post(`${url}`, pageAccessToken, {
      ...requestData,
    });
    debugFacebook(
      `Successfully sent data to facebook ${JSON.stringify(requestData)}`,
    );
    return response;
  } catch (e) {
    const targetRecipient = data?.recipient?.id || data?.recipient?.comment_id;

    debugError(
      `Facebook Graph request failed ${JSON.stringify({
        path: url,
        pageId: recipientId,
        targetRecipient,
        requestType: data?.sender_action ? 'sender_action' : 'message',
        code: e.code,
        errorSubcode: e.error_subcode,
        fbtraceId: e.fbtrace_id,
        message: e.message,
      })}`,
    );
    // request-level failures (unknown error, invalid parameter, messaging
    // window, already replied) say nothing about the token's health
    const messageLevelErrorCodes = [1, 10, 100, 10900];
    if (e.message.includes('access token')) {
      await models.FacebookIntegrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'page-token', error: `${e.message}` } },
      );
    } else if (!messageLevelErrorCodes.includes(e.code)) {
      await models.FacebookIntegrations.updateOne(
        { _id: integration._id },
        { $set: { healthStatus: 'account-token', error: `${e.message}` } },
      );
    }

    if (e.message.includes('does not exist')) {
      throw new FacebookSendError(
        'Comment has been deleted by the customer',
        e.code,
        e.error_subcode,
      );
    }

    throw new FacebookSendError(e.message, e.code, e.error_subcode);
  }
};

type IFacebookReactionPayload =
  | {
      recipient: { id: string };
      sender_action: 'react';
      payload: {
        message_id: string;
        reaction: string;
      };
    }
  | {
      recipient: { id: string };
      sender_action: 'unreact';
      payload: {
        message_id: string;
      };
    };

export const sendReaction = async (
  models: IModels,
  data: IFacebookReactionPayload,
  pageId: string,
  integrationId: string,
) => {
  const integration = await models.FacebookIntegrations.getIntegration({
    erxesApiId: integrationId,
  });
  const pageAccessToken = getPageAccessTokenFromMap(
    pageId,
    integration.facebookPageTokensMap || {},
  );

  if (!pageAccessToken) {
    throw new Error(`Page access token not found for page: ${pageId}`);
  }

  const response = await fetch(
    `https://graph.facebook.com/v25.0/${pageId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  );
  const result = (await response.json()) as {
    error?: { message?: string };
  };

  if (!response.ok) {
    const message = result.error?.message || 'Failed to react on Facebook';
    debugError(`Facebook reaction failed: ${message}`);
    throw new Error(`Facebook reaction failed: ${message}`);
  }

  return result;
};

export const generateAttachmentMessages = (
  subdomain: string,
  attachments: IAttachment[],
) => {
  const messages: IAttachmentMessage[] = [];

  for (const attachment of attachments || []) {
    let type = 'file';

    if (attachment.type.startsWith('image')) {
      type = 'image';
    }

    const url = generateAttachmentUrl(subdomain, attachment.url);

    messages.push({
      attachment: {
        type,
        payload: {
          url,
        },
      },
    });
  }

  return messages;
};
