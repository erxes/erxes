import { IAttachment } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { parseAiMediaId } from '@/integrations/facebook/meta/automation/utils/turnTaking';
import { isClosingStatus } from '@/ticket/utils/cpNotifications';

const MAX_OPEN_TICKETS = 5;

// Automation targets carry either the inbox conversation id or, for Facebook,
// the integration's own conversation id; tickets relate to the inbox one.
export const resolveInboxConversationId = async (
  models: IModels,
  conversationId?: string,
) => {
  if (!conversationId) {
    return undefined;
  }

  if (await models.Conversations.exists({ _id: conversationId })) {
    return conversationId;
  }

  const facebookConversation = await models.FacebookConversations.findOne(
    { _id: conversationId },
    { erxesApiId: 1 },
  ).lean<{ erxesApiId?: string }>();

  return facebookConversation?.erxesApiId || undefined;
};

// The open tickets made from a conversation, newest first: tickets keep
// their source conversations themselves (`sourceConversationIds`).
export const findOpenConversationTickets = async ({
  models,
  conversationId,
}: {
  models: IModels;
  conversationId: string;
}) => {
  const tickets = await models.Ticket.find(
    { sourceConversationIds: conversationId },
    { _id: 1, number: 1, name: 1, statusType: 1 },
  )
    .sort({ createdAt: -1 })
    .lean<
      Array<{ _id: string; number?: string; name?: string; statusType?: number }>
    >();

  return tickets
    .filter(({ statusType }) => !isClosingStatus(statusType))
    .slice(0, MAX_OPEN_TICKETS)
    .map(({ _id, number, name }) => ({ _id, number, name }));
};

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  ogg: 'audio/ogg',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  pdf: 'application/pdf',
  txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

// Conversation media is typed by kind ("image"); ticket attachments are read
// by MIME type, so a kind would hide the file.
const toMimeType = (type: string | undefined, url: string) => {
  if (type?.includes('/')) {
    return type;
  }

  const extension = url.split('?')[0].split('.').pop()?.toLowerCase() || '';

  if (MIME_BY_EXTENSION[extension]) {
    return MIME_BY_EXTENSION[extension];
  }

  return type && type !== 'file' ? `${type}/*` : 'application/octet-stream';
};

// Media ids come from the model's enum; each is looked up in the messages of
// this conversation only, so no id can pull a file from somewhere else.
export const resolveConversationMedia = async ({
  models,
  mediaIds,
  conversationIds,
}: {
  models: IModels;
  mediaIds: string[];
  conversationIds: string[];
}): Promise<IAttachment[]> => {
  const parsed = mediaIds
    .map(parseAiMediaId)
    .filter((media): media is { messageId: string; index: number } => !!media);

  if (!parsed.length || !conversationIds.length) {
    return [];
  }

  const messageIds = [...new Set(parsed.map(({ messageId }) => messageId))];
  const selector = {
    _id: { $in: messageIds },
    conversationId: { $in: conversationIds },
  };
  const projection = { attachments: 1 };
  const [facebookMessages, inboxMessages] = await Promise.all([
    models.FacebookConversationMessages.find(selector, projection).lean<
      Array<{ _id: string; attachments?: IAttachment[] }>
    >(),
    models.ConversationMessages.find(selector, projection).lean<
      Array<{ _id: string; attachments?: IAttachment[] }>
    >(),
  ]);
  const attachmentsByMessageId = new Map(
    [...facebookMessages, ...inboxMessages].map(({ _id, attachments }) => [
      _id,
      attachments || [],
    ]),
  );
  const seenUrls = new Set<string>();

  return parsed.flatMap(({ messageId, index }) => {
    const attachment = attachmentsByMessageId.get(messageId)?.[index];

    if (!attachment?.url || seenUrls.has(attachment.url)) {
      return [];
    }

    seenUrls.add(attachment.url);

    return [
      {
        name: attachment.name || `${attachment.type || 'file'}-${index + 1}`,
        url: attachment.url,
        type: toMimeType(attachment.type, attachment.url),
        size: attachment.size || 0,
      },
    ];
  });
};
