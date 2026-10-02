import type { ISendMailInput } from '@/integrations/mail/utils/transports/types';
import { MailSendError } from '@/integrations/mail/utils/transports/common';
import {
  readAttachmentBytes,
  type IInboundAttachment,
} from '@/integrations/mail/utils/attachments';

const REACTION_MIME_TYPE = 'text/vnd.google.email-reaction+json';
const MAX_REACTION_BYTES = 4096;

export const isValidMailReactionEmoji = (emoji: string) =>
  Boolean(
    emoji &&
      Buffer.byteLength(emoji, 'utf8') <= 64 &&
      [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(emoji)]
        .length === 1 &&
      (/\p{Extended_Pictographic}/u.test(emoji) ||
        /^(?:[\u{1F1E6}-\u{1F1FF}]){2}$/u.test(emoji) ||
        /^[#*0-9]\uFE0F?\u20E3$/u.test(emoji)),
  );

export const readInboundMailReaction = async (
  subdomain: string,
  attachments: IInboundAttachment[] = [],
): Promise<string | undefined> => {
  const part = attachments.find(
    ({ mimeType, disposition }) =>
      mimeType === REACTION_MIME_TYPE && disposition !== 'attachment',
  );
  if (!part || (part.size ?? 0) > MAX_REACTION_BYTES) return undefined;

  try {
    if (
      part.content &&
      part.content.length > Math.ceil(MAX_REACTION_BYTES / 3) * 4
    )
      return undefined;
    let bytes: Buffer | undefined;
    if (part.content) {
      bytes = Buffer.from(part.content, 'base64');
    } else if (part.url) {
      bytes = await readAttachmentBytes(subdomain, part.url);
    }
    if (!bytes || bytes.byteLength > MAX_REACTION_BYTES) return undefined;

    const reaction: unknown = JSON.parse(bytes.toString('utf8'));
    if (
      typeof reaction === 'object' &&
      reaction !== null &&
      'version' in reaction &&
      reaction.version === 1 &&
      'emoji' in reaction &&
      typeof reaction.emoji === 'string' &&
      isValidMailReactionEmoji(reaction.emoji)
    ) {
      return reaction.emoji;
    }
  } catch {
    // Invalid or unavailable reaction parts remain visible as regular emails.
    return undefined;
  }
  return undefined;
};

const ADDRESS = /^[^\s<>@]+@[^\s<>@]+$/;
const MESSAGE_ID = /^<[^<>\r\n]+>$/;

const encodedPart = (value: string) =>
  Buffer.from(value, 'utf8')
    .toString('base64')
    .match(/.{1,76}/g)
    ?.join('\r\n') ?? '';

export const buildReactionMime = (input: ISendMailInput): string => {
  const to = input.to[0];
  if (
    !input.reactionEmoji ||
    !isValidMailReactionEmoji(input.reactionEmoji) ||
    !ADDRESS.test(input.from) ||
    !ADDRESS.test(to ?? '') ||
    !MESSAGE_ID.test(input.messageId) ||
    !MESSAGE_ID.test(input.inReplyTo ?? '')
  ) {
    throw new MailSendError('Invalid email reaction', false);
  }

  const boundary = `erxes-reaction-${input.messageId.slice(1, 37)}`;
  const subject = `=?UTF-8?B?${Buffer.from(input.subject, 'utf8').toString(
    'base64',
  )}?=`;
  const references = (input.references ?? [])
    .filter((reference) => MESSAGE_ID.test(reference))
    .join(' ');
  const headers = [
    `From: <${input.from}>`,
    `To: <${to}>`,
    `Subject: ${subject}`,
    `Message-ID: ${input.messageId}`,
    `In-Reply-To: ${input.inReplyTo}`,
    ...(references ? [`References: ${references}`] : []),
    ...(ADDRESS.test(input.replyTo) ? [`Reply-To: <${input.replyTo}>`] : []),
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  const part = (type: string, body: string) =>
    `--${boundary}\r\nContent-Type: ${type}; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${encodedPart(
      body,
    )}\r\n`;

  return [
    `${headers.join('\r\n')}\r\n\r\n`,
    part('text/plain', `${input.reactionEmoji}\nReacted to your email.`),
    part(
      'text/vnd.google.email-reaction+json',
      JSON.stringify({ emoji: input.reactionEmoji, version: 1 }),
    ),
    part('text/html', input.html),
    `--${boundary}--\r\n`,
  ].join('');
};
