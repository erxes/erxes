import { z } from 'zod';
import { stripHtml } from 'string-strip-html';
import type {
  IViberSendPart,
  ViberMessageBody,
} from '@/integrations/viber/@types/transport';
import { validateViberToken } from '@/integrations/viber/utils/account';
import { getViberVideoLink, isViberStorageKey } from './attachment';
import {
  isViberMessageToken,
  parseViberWebhookBody,
} from '@/integrations/viber/utils/webhook';

const httpsUrl = z
  .string()
  .max(2000)
  .url()
  .refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  });

export const viberStructuredMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('url'), media: httpsUrl }).strict(),
  z
    .object({
      type: z.literal('location'),
      location: z
        .object({
          lat: z.number().finite().min(-90).max(90),
          lon: z.number().finite().min(-180).max(180),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      type: z.literal('contact'),
      contact: z
        .object({
          name: z.string().trim().min(1).max(128),
          phone_number: z.string().trim().min(1).max(128),
        })
        .strict(),
    })
    .strict(),
  z
    .object({
      type: z.literal('sticker'),
      sticker_id: z.string().regex(/^\d+$/).max(20),
    })
    .strict(),
]);

const attachmentSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .max(256)
      .regex(/^[^/\\]+\.[a-zA-Z0-9]+$/)
      .refine((value) =>
        Array.from(value).every(
          (char) => char.charCodeAt(0) > 31 && char.charCodeAt(0) !== 127,
        ),
      ),
    // Stream URLs are shared as links, never fetched by the media relay.
    url: z
      .string()
      .refine(
        (value) => isViberStorageKey(value) || !!getViberVideoLink(value),
      ),
    size: z
      .number()
      .int()
      .positive()
      .max(50 * 1024 * 1024),
    type: z.string().min(1).max(128),
  })
  .refine(
    ({ url, type }) => isViberStorageKey(url) || type.startsWith('video/'),
  );

export const buildViberSendParts = (
  content: string,
  attachments: unknown = [],
  structured?: unknown,
): { content: string; parts: IViberSendPart[] } => {
  const text = stripHtml(
    content.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<\/p>/gi, '\n'),
  ).result.trim();
  if (text.length > 7000)
    throw new Error('Viber text must not exceed 7000 characters');
  const files = z.array(attachmentSchema).max(10).parse(attachments);
  const parts: IViberSendPart[] = [];
  if (text) parts.push({ body: { type: 'text', text }, state: 'pending' });
  for (const attachment of files) {
    const videoLink = getViberVideoLink(attachment.url);
    if (videoLink) {
      parts.push({
        body: { type: 'text', text: `Video: ${attachment.name}\n${videoLink}` },
        attachment,
        state: 'pending',
      });
      continue;
    }
    const extension = attachment.name.split('.').pop()?.toLowerCase();
    let body: ViberMessageBody = {
      type: 'file',
      media: '',
      size: attachment.size,
      file_name: attachment.name,
    };
    // Send larger images as files so they also work on iOS (1 MiB picture cap).
    if (
      attachment.size <= 1024 * 1024 &&
      ((attachment.type === 'image/jpeg' &&
        ['jpg', 'jpeg'].includes(extension ?? '')) ||
        (attachment.type === 'image/png' && extension === 'png') ||
        (attachment.type === 'image/gif' && extension === 'gif'))
    ) {
      body = { type: 'picture', media: '', text: '' };
    } else if (
      attachment.type === 'video/mp4' &&
      extension === 'mp4' &&
      attachment.size <= 26 * 1024 * 1024
    ) {
      body = { type: 'video', media: '', size: attachment.size };
    }
    parts.push({ body, attachment, state: 'pending' });
  }
  if (structured !== undefined && structured !== null) {
    parts.push({
      body: viberStructuredMessageSchema.parse(structured),
      state: 'pending',
    });
  }
  if (!parts.length)
    throw new Error(
      'A Viber reply requires text, an attachment, or a supported message',
    );
  const structuredBody = parts.find((part) =>
    ['url', 'location', 'contact', 'sticker'].includes(part.body.type),
  )?.body;
  let label = '';
  if (structuredBody?.type === 'url') label = structuredBody.media;
  if (structuredBody?.type === 'location')
    label = `Location: ${structuredBody.location.lat}, ${structuredBody.location.lon}`;
  if (structuredBody?.type === 'contact')
    label = `Contact: ${structuredBody.contact.name}\nPhone: ${structuredBody.contact.phone_number}`;
  if (structuredBody?.type === 'sticker')
    label = `Viber sticker: ${structuredBody.sticker_id}`;
  return {
    content: [text, label].filter(Boolean).join('\n') || 'Attachment',
    parts,
  };
};

export type ViberSendResult =
  | { state: 'sent'; messageToken: string }
  | { state: 'rejected' | 'unknown'; error: string };

export const sendViberMessage = async (
  token: string,
  receiver: string,
  senderName: string,
  body: ViberMessageBody,
): Promise<ViberSendResult> => {
  validateViberToken(token);
  if (!receiver.trim() || !senderName.trim())
    throw new Error('Viber receiver and sender are required');
  const payload = JSON.stringify({
    ...body,
    receiver,
    sender: { name: Array.from(senderName).slice(0, 28).join('') },
  });
  if (Buffer.byteLength(payload) > 30 * 1024)
    throw new Error('Viber message exceeds the 30 KiB request limit');
  try {
    const response = await fetch('https://chatapi.viber.com/pa/send_message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Viber-Auth-Token': token,
      },
      body: payload,
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok)
      return {
        state: 'unknown',
        error:
          'Viber did not confirm sending. Check delivery before sending again.',
      };
    const value = parseViberWebhookBody(Buffer.from(await response.text()));
    if (
      typeof value !== 'object' ||
      value === null ||
      !('status' in value) ||
      typeof value.status !== 'number' ||
      !Number.isSafeInteger(value.status) ||
      value.status < 0
    ) {
      return {
        state: 'unknown',
        error:
          'Viber returned an invalid send confirmation. Do not automatically resend.',
      };
    }
    if (value.status !== 0) {
      return {
        state: 'rejected',
        error: `Viber rejected the message (code ${value.status}). Check the connection, subscription, and message format before retrying.`,
      };
    }
    if (
      !('message_token' in value) ||
      !isViberMessageToken(value.message_token)
    ) {
      return {
        state: 'unknown',
        error:
          'Viber accepted the request without a usable message token. Do not automatically resend.',
      };
    }
    return { state: 'sent', messageToken: value.message_token };
  } catch {
    return {
      state: 'unknown',
      error:
        'Viber did not confirm sending. Check delivery before sending again.',
    };
  }
};
