import PostalMime, { Address, Attachment, Header } from 'postal-mime';
import { toHex } from './hmac';
import {
  ForwardableEmailMessage,
  InboundPayload,
  ParsedAttachment,
} from './types';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const FORWARDED_HEADERS = [
  'auto-submitted',
  'delivered-to',
  'precedence',
  'return-path',
  'x-autoreply',
  'x-autorespond',
  'x-autoresponder',
];

// A forwarded message carries one Delivered-To per hop, and the mailbox that
// forwarded it is only one of them, so every value has to travel.
const REPEATED_HEADERS = ['delivered-to'];

const textToHtml = (text: string) =>
  `<div>${text
    .replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
    .replace(/\r?\n/g, '<br>')}</div>`;

const flattenAddresses = (addresses?: Address[]) =>
  (addresses ?? []).flatMap((entry) =>
    entry.group
      ? entry.group.map(({ name, address }) => ({ name, address }))
      : [{ name: entry.name, address: entry.address }],
  );

const pickHeaders = (headers?: Header[]) => {
  const picked: Record<string, string> = {};

  for (const { key, value } of headers ?? []) {
    const name = key.toLowerCase();

    if (!FORWARDED_HEADERS.includes(name)) {
      continue;
    }

    if (!(name in picked)) {
      picked[name] = value;
      continue;
    }

    if (REPEATED_HEADERS.includes(name)) {
      picked[name] = `${picked[name]}, ${value}`;
    }
  }

  return picked;
};

const toBytes = (content: Attachment['content']) => {
  if (typeof content === 'string') {
    return new TextEncoder().encode(content);
  }

  return content instanceof Uint8Array ? content : new Uint8Array(content);
};

const toParsedAttachment = (
  attachment: Attachment,
  index: number,
): ParsedAttachment => ({
  filename: attachment.filename || `attachment-${index + 1}`,
  mimeType: attachment.mimeType,
  contentId: attachment.contentId?.replace(/^<|>$/g, '') || undefined,
  disposition: attachment.disposition ?? undefined,
  bytes: toBytes(attachment.content),
});

const synthesizeMessageId = async (
  message: ForwardableEmailMessage,
  mail: { date?: string; subject?: string; html?: string; text?: string },
) => {
  const seed = [
    message.from,
    message.to,
    mail.date ?? '',
    mail.subject ?? '',
    (mail.html ?? mail.text ?? '').slice(0, 512),
  ].join('|');

  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(seed),
  );

  return `<${toHex(digest).slice(0, 40)}@synthesized.invalid>`;
};

export const parseInboundMail = async (message: ForwardableEmailMessage) => {
  const mail = await PostalMime.parse(message.raw);

  const payload: InboundPayload = {
    to: message.to,
    messageId: mail.messageId || (await synthesizeMessageId(message, mail)),
    envelopeFrom: message.from,
    inReplyTo: mail.inReplyTo,
    references: mail.references ? mail.references.split(/\s+/) : [],
    from: mail.from
      ? { name: mail.from.name, address: mail.from.address }
      : { address: message.from },
    recipients: flattenAddresses(mail.to),
    cc: flattenAddresses(mail.cc),
    bcc: flattenAddresses(mail.bcc),
    subject: mail.subject,
    html: mail.html ?? (mail.text ? textToHtml(mail.text) : ''),
    receivedAt: mail.date ?? new Date().toISOString(),
    headers: pickHeaders(mail.headers),
    attachments: [],
  };

  const attachments = (mail.attachments ?? []).map(toParsedAttachment);

  return { payload, attachments };
};
