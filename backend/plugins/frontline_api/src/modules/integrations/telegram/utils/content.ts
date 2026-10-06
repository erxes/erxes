import type { TelegramMessage } from './message';
import {
  MAX_TELEGRAM_DOWNLOAD_BYTES,
  TELEGRAM_FILE_TOO_LARGE_NOTICE,
} from './fileLimits';

export interface TelegramInboxPoll {
  question: string;
  answers: { id: string | number; text: string }[];
  allowMultiselect: boolean;
  expiry?: string;
  results: {
    isFinalized: boolean;
    totalVoters: number;
    answerCounts: { id: string | number; count: number }[];
  };
}

export interface TelegramMessageMetadata {
  chatType?: string;
  senderName?: string;
  messageId?: string;
  messageIds?: string[];
  textChunked?: boolean;
  contentType?: string;
  mediaGroupId?: string;
  editedAt?: string;
  topicName?: string;
  replyTo?: {
    messageId: string;
    chatId: string;
    senderName: string;
    content: string;
  };
}

export interface TelegramMessageContent {
  content: string;
  attachment?: TelegramAttachmentSource;
  additionalAttachments?: TelegramAttachmentSource[];
  contentType: string;
  poll?: TelegramInboxPoll;
}

export interface TelegramAttachmentSource {
  fileId: string;
  fileName?: string;
  mimeType?: string;
}

/** Adapts provider answers and tallies to the existing inbox poll shape. */
export const normalizeTelegramPoll = (
  poll: NonNullable<TelegramMessage['poll']>,
): TelegramInboxPoll => ({
  question: poll.question,
  answers: poll.options.map((option, index) => ({
    id: option.persistent_id ?? String(index),
    text: option.text + (option.media ? ' [Media — view in Telegram]' : ''),
  })),
  allowMultiselect: poll.allows_multiple_answers,
  expiry: poll.close_date
    ? new Date(poll.close_date * 1000).toISOString()
    : undefined,
  results: {
    isFinalized: poll.is_closed,
    totalVoters: poll.total_voter_count,
    answerCounts: poll.options.map((option, index) => ({
      id: option.persistent_id ?? String(index),
      count: option.voter_count,
    })),
  },
});

/** Selects the highest-resolution photo, using file size to break ties. */
const largestPhoto = (photos: NonNullable<TelegramMessage['photo']>) =>
  photos.reduce<(typeof photos)[number] | undefined>(
    (largest, candidate) =>
      !largest ||
      candidate.width * candidate.height > largest.width * largest.height ||
      (candidate.width * candidate.height === largest.width * largest.height &&
        (candidate.file_size ?? 0) > (largest.file_size ?? 0))
        ? candidate
        : largest,
    undefined,
  );

/** Maps media metadata and captions, replacing oversized files with a visible notice. */
const fileContent = (
  message: TelegramMessage,
  file: NonNullable<TelegramMessage['document']>,
  contentType: string,
  extension: string,
  mimeType: string,
): TelegramMessageContent => {
  const content = message.caption ?? '';
  if ((file.file_size ?? 0) > MAX_TELEGRAM_DOWNLOAD_BYTES) {
    return {
      content: [content, TELEGRAM_FILE_TOO_LARGE_NOTICE]
        .filter(Boolean)
        .join('\n'),
      contentType,
    };
  }
  return {
    content,
    contentType,
    attachment: {
      fileId: file.file_id,
      fileName:
        file.file_name || `${contentType}-${file.file_unique_id}.${extension}`,
      mimeType: file.mime_type || mimeType,
    },
  };
};

/** Normalizes supported content and supplies a visible fallback for unsupported events. */
export const getTelegramMessageContent = (
  message: TelegramMessage,
): TelegramMessageContent => {
  if (message.live_photo) {
    const photo = largestPhoto(message.live_photo.photo ?? []);
    const still = photo
      ? fileContent(message, photo, 'photo', 'jpg', 'image/jpeg')
      : undefined;
    const video = fileContent(
      message,
      message.live_photo,
      'video',
      'mp4',
      'video/mp4',
    );
    return {
      contentType: 'live_photo',
      content: [
        ...new Set([still?.content, video.content].filter(Boolean)),
      ].join('\n'),
      attachment: still?.attachment ?? video.attachment,
      additionalAttachments:
        still?.attachment && video.attachment ? [video.attachment] : [],
    };
  }
  // Animation also includes a compatibility document. Choose its real type first.
  if (message.animation)
    return fileContent(
      message,
      message.animation,
      'animation',
      'mp4',
      'video/mp4',
    );
  if (message.video)
    return fileContent(message, message.video, 'video', 'mp4', 'video/mp4');
  if (message.audio)
    return fileContent(message, message.audio, 'audio', 'mp3', 'audio/mpeg');
  if (message.voice)
    return fileContent(message, message.voice, 'voice', 'ogg', 'audio/ogg');
  if (message.video_note)
    return fileContent(
      message,
      message.video_note,
      'video_note',
      'mp4',
      'video/mp4',
    );
  if (message.sticker) {
    const sticker = message.sticker;
    const result = fileContent(
      message,
      sticker,
      'sticker',
      sticker.is_video ? 'webm' : sticker.is_animated ? 'tgs' : 'webp',
      sticker.is_video
        ? 'video/webm'
        : sticker.is_animated
          ? 'application/x-tgsticker'
          : 'image/webp',
    );
    result.content = [
      sticker.emoji ? `Sticker ${sticker.emoji}` : 'Sticker',
      result.content,
    ]
      .filter(Boolean)
      .join('\n');
    return result;
  }
  const photo = message.photo?.length ? largestPhoto(message.photo) : undefined;
  if (photo) return fileContent(message, photo, 'photo', 'jpg', 'image/jpeg');
  if (message.document)
    return fileContent(
      message,
      message.document,
      'document',
      'bin',
      'application/octet-stream',
    );
  if (message.contact) {
    const contact = message.contact;
    return {
      contentType: 'contact',
      content: `Contact: ${[contact.first_name, contact.last_name]
        .filter(Boolean)
        .join(' ')}\n${contact.phone_number}`,
    };
  }
  const location = message.venue?.location ?? message.location;
  if (location)
    return {
      contentType: message.venue ? 'venue' : 'location',
      content: [
        message.venue?.title,
        message.venue?.address,
        `Location: ${location.latitude}, ${location.longitude}`,
        location.live_period
          ? 'Live location snapshot; updates appear when Telegram sends an edit.'
          : undefined,
        `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`,
      ]
        .filter(Boolean)
        .join('\n'),
    };
  if (message.poll)
    return {
      contentType: 'poll',
      poll: normalizeTelegramPoll(message.poll),
      content: [
        message.poll.description,
        message.poll.explanation,
        message.poll.media ? '[Poll media — view in Telegram]' : undefined,
      ]
        .filter(Boolean)
        .join('\n'),
    };
  if (message.dice)
    return {
      contentType: 'dice',
      content: `${message.dice.emoji} ${message.dice.value}`,
    };
  if (message.forum_topic_created)
    return {
      contentType: 'service',
      content: `Topic created: ${message.forum_topic_created.name}`,
    };
  if (message.forum_topic_edited)
    return {
      contentType: 'service',
      content: message.forum_topic_edited.name
        ? `Topic renamed: ${message.forum_topic_edited.name}`
        : 'Topic appearance changed.',
    };
  if (message.new_chat_title)
    return {
      contentType: 'service',
      content: `Chat renamed: ${message.new_chat_title}`,
    };
  if (message.text?.trim())
    return { contentType: 'text', content: message.text };

  const knownTypes = [
    'paid_media',
    'story',
    'game',
    'invoice',
    'successful_payment',
    'checklist',
    'rich_message',
    'new_chat_members',
    'left_chat_member',
    'new_chat_photo',
    'delete_chat_photo',
    'pinned_message',
    'forum_topic_closed',
    'forum_topic_reopened',
    'general_forum_topic_hidden',
    'general_forum_topic_unhidden',
    'video_chat_started',
    'video_chat_ended',
    'video_chat_scheduled',
    'video_chat_participants_invited',
    'migrate_to_chat_id',
    'migrate_from_chat_id',
  ];
  const kind = knownTypes.find((key) => message[key] !== undefined);
  const label = kind ? kind.replace(/_/g, ' ') : 'message type';
  return {
    contentType: kind ?? 'unsupported',
    content: [
      message.caption,
      `[Telegram ${label} is not displayed here. View it in Telegram.]`,
    ]
      .filter(Boolean)
      .join('\n'),
  };
};

/** Supplies list previews without adding artificial captions to message bubbles. */
export const getTelegramMessagePreview = (
  message: TelegramMessageContent,
): string => {
  if (message.content) return message.content;
  if (message.poll) return message.poll.question;
  if (message.contentType === 'document' && message.attachment?.fileName)
    return message.attachment.fileName;
  return message.contentType.replace(/_/g, ' ');
};

/** Prefers channel and anonymous-admin identity over Telegram compatibility users. */
export const getTelegramSenderName = (
  message: Pick<TelegramMessage, 'from' | 'sender_chat' | 'author_signature'>,
): string =>
  message.sender_chat?.title ??
  message.author_signature ??
  [message.from?.first_name, message.from?.last_name].filter(Boolean).join(' ');

/** Preserves provider context, edits and explicit reply references in extraData. */
export const getTelegramMessageMetadata = (
  message: TelegramMessage,
): TelegramMessageMetadata => ({
  chatType: message.chat.type,
  senderName: getTelegramSenderName(message),
  messageId: String(message.message_id),
  contentType: getTelegramMessageContent(message).contentType,
  mediaGroupId: message.media_group_id,
  editedAt: message.edit_date
    ? new Date(message.edit_date * 1000).toISOString()
    : undefined,
  topicName:
    message.forum_topic_created?.name ?? message.forum_topic_edited?.name,
  // Telegram attaches the topic's creation message to ordinary forum messages.
  // It is routing context, not a quote selected by the sender.
  replyTo:
    message.reply_to_message &&
    !(
      message.is_topic_message &&
      message.reply_to_message.message_id === message.message_thread_id &&
      message.reply_to_message.forum_topic_created &&
      !message.quote
    )
      ? {
          messageId: String(message.reply_to_message.message_id),
          chatId: String(message.reply_to_message.chat.id),
          senderName: getTelegramSenderName(message.reply_to_message),
          content: (
            message.quote?.text ??
            message.reply_to_message.text ??
            message.reply_to_message.caption ??
            '[Attachment or service message]'
          ).slice(0, 500),
        }
      : undefined,
});

/** Escapes literal provider text and preserves line breaks for the inbox renderer. */
export const telegramTextToHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>');

/** Partitions forum topics only; ordinary reply thread IDs stay in the same chat. */
export const getTelegramThreadId = (message: TelegramMessage): number =>
  message.is_topic_message ? (message.message_thread_id ?? 0) : 0;
