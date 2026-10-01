import type { ISendMailInput } from '@/integrations/mail/utils/transports/types';
import { MailSendError } from '@/integrations/mail/utils/transports/common';

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
