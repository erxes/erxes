import type { IModels } from '~/connectionResolvers';
import type {
  IFacebookHistoryImport,
  IFacebookIntegrationDocument,
} from '@/integrations/facebook/@types/integrations';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { getOrCreateCustomer } from '@/integrations/facebook/controller/store';
import { debugError, debugFacebook } from '@/integrations/facebook/debuggers';
import { upsertFacebookConversation } from '@/integrations/facebook/services/conversationSync';
import { getSharedAttachmentName } from '@/integrations/facebook/services/messagePreview';
import { CONVERSATION_STATUSES } from '@/inbox/db/definitions/constants';
import { getErrorMessage } from '@/integrations/utils';
import { sendWorkerQueue } from 'erxes-api-shared/utils';

export const FACEBOOK_HISTORY_IMPORT_QUEUE = 'facebookHistoryImport';

const GRAPH_URL = 'https://graph.facebook.com/v25.0';
const GRAPH_PAGE_SIZE = 100;
const CONVERSATIONS_API_INTERVAL_MS = 500;
const REPLY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const STALE_RUN_MS = 6 * 60 * 60 * 1000;

const CONVERSATION_FIELDS = 'id,updated_time,participants';
const MESSAGE_FIELDS =
  'id,message,created_time,from,sticker,shares{link,name},attachments{id,mime_type,name,file_url,image_data,video_data}';

type TGraphError = { message?: string; code?: number };

type TGraphPage<T> = {
  data?: T[];
  paging?: { cursors?: { after?: string }; next?: string };
  error?: TGraphError;
};

type TGraphConversation = {
  id: string;
  updated_time?: string;
  participants?: { data?: { id: string; name?: string }[] };
};

type TGraphAttachment = {
  id?: string;
  mime_type?: string;
  name?: string;
  file_url?: string;
  image_data?: { url?: string; preview_url?: string };
  video_data?: { url?: string; preview_url?: string };
};

type TGraphMessage = {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id?: string; name?: string };
  sticker?: string;
  shares?: { data?: { link?: string; name?: string }[] };
  attachments?: { data?: TGraphAttachment[] };
};

type TImportedAttachment = { type: string; url: string; name?: string };

type TImportProgress = Pick<
  IFacebookHistoryImport,
  'conversations' | 'messages' | 'skippedConversations'
>;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const graphGet = async <T>(
  url: string,
  token: string,
): Promise<TGraphPage<T>> => {
  await sleep(CONVERSATIONS_API_INTERVAL_MS);

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await response.json()) as TGraphPage<T>;

  if (!response.ok || body.error) {
    throw new Error(
      body.error?.message ||
        `Facebook Graph request failed with status ${response.status}`,
    );
  }

  return body;
};

async function* paginate<T>(
  url: string,
  token: string,
): AsyncGenerator<T, void, undefined> {
  let after: string | undefined;

  while (true) {
    const page = await graphGet<T>(
      after ? `${url}&after=${encodeURIComponent(after)}` : url,
      token,
    );

    for (const item of page.data || []) {
      yield item;
    }

    after = page.paging?.next ? page.paging.cursors?.after : undefined;

    if (!after) {
      return;
    }
  }
}

const toDate = (value?: string) => {
  const parsed = value ? new Date(value) : new Date(NaN);

  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const formatGraphAttachments = (message: TGraphMessage) => {
  const attachments: TImportedAttachment[] = [];

  for (const attachment of message.attachments?.data || []) {
    if (attachment.image_data?.url) {
      attachments.push({
        type: 'image',
        url: attachment.image_data.url,
        name: attachment.name,
      });
    } else if (attachment.video_data?.url) {
      attachments.push({
        type: 'video',
        url: attachment.video_data.url,
        name: attachment.name,
      });
    } else if (attachment.file_url) {
      attachments.push({
        type: attachment.mime_type?.startsWith('audio') ? 'audio' : 'file',
        url: attachment.file_url,
        name: attachment.name,
      });
    }
  }

  if (message.sticker) {
    attachments.push({ type: 'sticker', url: message.sticker });
  }

  for (const share of message.shares?.data || []) {
    if (share.link) {
      attachments.push({
        type: 'share',
        url: share.link,
        name: share.name || getSharedAttachmentName(share.link),
      });
    }
  }

  return attachments;
};

const previewOf = (
  message: TGraphMessage,
  attachments: TImportedAttachment[],
) => {
  if (message.message) {
    return message.message;
  }

  const primary = attachments[0];

  if (primary?.type === 'sticker') return 'Sent a sticker';
  if (primary?.type === 'image') return 'Sent an image';
  if (primary?.type === 'video') return 'Sent a video';
  if (primary?.type === 'audio') return 'Voice message';
  if (primary?.type === 'file') return 'Sent a file';
  if (primary) return 'Shared content';

  return 'Unsupported Messenger message';
};

const setHistoryImport = (
  models: IModels,
  integrationId: string,
  doc: Partial<IFacebookHistoryImport>,
) =>
  models.FacebookIntegrations.updateOne(
    { _id: integrationId },
    {
      $set: Object.fromEntries(
        Object.entries(doc).map(([key, value]) => [
          `historyImport.${key}`,
          value ?? null,
        ]),
      ),
    },
  );

const fetchConversationMessages = async (
  conversationId: string,
  token: string,
) => {
  const messages: TGraphMessage[] = [];

  try {
    for await (const message of paginate<TGraphMessage>(
      `${GRAPH_URL}/${conversationId}/messages?fields=${MESSAGE_FIELDS}&limit=${GRAPH_PAGE_SIZE}`,
      token,
    )) {
      messages.push(message);
    }
  } catch (error) {
    if (!messages.length) {
      throw error;
    }

    debugFacebook(
      `Stopped reading older messages of ${conversationId}: ${getErrorMessage(
        error,
      )}`,
    );
  }

  return messages;
};

const importConversation = async ({
  models,
  subdomain,
  integration,
  pageId,
  token,
  conversation,
}: {
  models: IModels;
  subdomain: string;
  integration: IFacebookIntegrationDocument;
  pageId: string;
  token: string;
  conversation: TGraphConversation;
}): Promise<number | null> => {
  const senderId = conversation.participants?.data?.find(
    (participant) => participant.id !== pageId,
  )?.id;

  if (!senderId) {
    return null;
  }

  const messages = await fetchConversationMessages(conversation.id, token);

  if (!messages.length) {
    return null;
  }

  const existingMids = new Set(
    (
      await models.FacebookConversationMessages.find(
        { mid: { $in: messages.map((message) => message.id) } },
        { mid: 1 },
      ).lean()
    ).map((message) => message.mid),
  );
  const fresh = messages.filter((message) => !existingMids.has(message.id));

  const customer = await getOrCreateCustomer(
    models,
    subdomain,
    pageId,
    senderId,
    INTEGRATION_KINDS.MESSENGER,
  );

  if (!customer?.erxesApiId) {
    throw new Error(`Customer not found for ${senderId}`);
  }

  const newest = messages[0];
  const oldest = messages[messages.length - 1];
  const newestAt = toDate(newest.created_time);
  const preview = previewOf(newest, formatGraphAttachments(newest));

  const fbConversation = await upsertFacebookConversation({
    models,
    integration,
    senderId,
    recipientId: pageId,
    timestamp: newestAt,
    content: preview,
  });

  if (!fbConversation.erxesApiId) {
    const isClosed = Date.now() - newestAt.getTime() > REPLY_WINDOW_MS;
    const inboxConversation = await models.Conversations.createConversation({
      customerId: customer.erxesApiId,
      integrationId: integration.erxesApiId,
      content: preview,
      createdAt: toDate(oldest.created_time),
      status: isClosed
        ? CONVERSATION_STATUSES.CLOSED
        : CONVERSATION_STATUSES.NEW,
      isCustomerRespondedLast: newest.from?.id === senderId,
    });

    await models.Conversations.updateOne(
      { _id: inboxConversation._id },
      {
        $set: {
          messageCount: fresh.length,
          updatedAt: newestAt,
          ...(isClosed ? { closedAt: newestAt } : {}),
        },
      },
    );

    fbConversation.erxesApiId = inboxConversation._id;
    await fbConversation.save();
  } else if (fresh.length) {
    await models.Conversations.updateOne(
      { _id: fbConversation.erxesApiId },
      { $inc: { messageCount: fresh.length } },
    );
  }

  if (fresh.length) {
    await models.FacebookConversationMessages.insertMany(
      fresh.map((message) => ({
        conversationId: fbConversation._id,
        mid: message.id,
        createdAt: toDate(message.created_time),
        content: message.message || '',
        attachments: formatGraphAttachments(message),
        ...(message.from?.id === senderId
          ? { customerId: customer.erxesApiId }
          : {}),
      })),
      { ordered: false },
    );
  }

  return fresh.length;
};

export const importMessengerHistory = async ({
  models,
  subdomain,
  integrationId,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
}) => {
  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId: integrationId,
    kind: INTEGRATION_KINDS.MESSENGER,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const progress: TImportProgress = {
    conversations: 0,
    messages: 0,
    skippedConversations: 0,
  };

  await setHistoryImport(models, integration._id, {
    status: 'running',
    startedAt: new Date(),
    finishedAt: undefined,
    error: undefined,
    ...progress,
  });

  try {
    for (const pageId of integration.facebookPageIds || []) {
      const token = integration.facebookPageTokensMap?.[pageId];

      if (!token) {
        throw new Error(`Page access token not found for page: ${pageId}`);
      }

      for await (const conversation of paginate<TGraphConversation>(
        `${GRAPH_URL}/${pageId}/conversations?platform=messenger&fields=${CONVERSATION_FIELDS}&limit=${GRAPH_PAGE_SIZE}`,
        token,
      )) {
        try {
          const imported = await importConversation({
            models,
            subdomain,
            integration,
            pageId,
            token,
            conversation,
          });

          if (imported === null) {
            progress.skippedConversations += 1;
          } else {
            progress.conversations += 1;
            progress.messages += imported;
          }
        } catch (error) {
          progress.skippedConversations += 1;
          debugError(
            `Failed to import Facebook conversation ${
              conversation.id
            }: ${getErrorMessage(error)}`,
          );
        }

        await setHistoryImport(models, integration._id, progress);
      }
    }

    await setHistoryImport(models, integration._id, {
      status: 'completed',
      finishedAt: new Date(),
      ...progress,
    });
  } catch (error) {
    await setHistoryImport(models, integration._id, {
      status: 'failed',
      finishedAt: new Date(),
      error: getErrorMessage(error),
      ...progress,
    });

    throw error;
  }
};

export const getMessengerHistoryImport = async (
  models: IModels,
  integrationId: string,
) => {
  const integration = await models.FacebookIntegrations.findOne(
    { erxesApiId: integrationId, kind: INTEGRATION_KINDS.MESSENGER },
    { historyImport: 1 },
  ).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  return integration.historyImport || null;
};

export const enqueueMessengerHistoryImport = async (
  models: IModels,
  subdomain: string,
  integrationId: string,
) => {
  const integration = await models.FacebookIntegrations.findOne({
    erxesApiId: integrationId,
    kind: INTEGRATION_KINDS.MESSENGER,
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const current = integration.historyImport;
  const isActive =
    current &&
    (current.status === 'queued' || current.status === 'running') &&
    current.startedAt &&
    Date.now() - new Date(current.startedAt).getTime() < STALE_RUN_MS;

  if (isActive) {
    throw new Error('Message history import is already running');
  }

  await setHistoryImport(models, integration._id, {
    status: 'queued',
    startedAt: new Date(),
    finishedAt: undefined,
    error: undefined,
    conversations: 0,
    messages: 0,
    skippedConversations: 0,
  });

  await sendWorkerQueue('frontline', FACEBOOK_HISTORY_IMPORT_QUEUE).add(
    'importMessengerHistory',
    { subdomain, integrationId },
    { removeOnComplete: true, removeOnFail: 50, attempts: 1 },
  );

  return getMessengerHistoryImport(models, integrationId);
};
