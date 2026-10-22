import { WhatsappWebhookMessage } from '@/integrations/whatsapp/utils/payload';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

export type WhatsappMediaKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'sticker';

export interface IWhatsappMediaRef {
  kind: WhatsappMediaKind;
  id: string;
  mimeType?: string;
  fileName?: string;
}

export interface IWhatsappInboundContent {
  text: string;
  media?: IWhatsappMediaRef;
}

const MEDIA_KINDS: ReadonlySet<string> = new Set<WhatsappMediaKind>([
  'image',
  'video',
  'audio',
  'document',
  'sticker',
]);

const isMediaKind = (type: string): type is WhatsappMediaKind =>
  MEDIA_KINDS.has(type);

const describeLocation = (
  location: NonNullable<WhatsappWebhookMessage['location']>,
) => {
  const label = [location.name, location.address].filter(Boolean).join(', ');
  const link = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;

  return label ? `📍 ${label}\n${link}` : `📍 ${link}`;
};

const describeContacts = (
  contacts: NonNullable<WhatsappWebhookMessage['contacts']>,
) =>
  contacts
    .map((contact) =>
      [
        contact.name?.formatted_name,
        ...(contact.phones || []).map(({ phone }) => phone),
      ]
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .map((line) => `👤 ${line}`)
    .join('\n');

const describeMedia = (
  message: WhatsappWebhookMessage,
): IWhatsappInboundContent | null => {
  const { type } = message;

  if (!isMediaKind(type)) return null;

  const media = message[type];

  return media
    ? {
        text: media.caption || '',
        media: {
          kind: type,
          id: media.id,
          mimeType: media.mime_type,
          fileName: media.filename,
        },
      }
    : null;
};

/** The inbox text of a non-media message; undefined when erxes can't show its type. */
const describeText = (message: WhatsappWebhookMessage): string | undefined => {
  switch (message.type) {
    case 'text':
      return message.text?.body;
    case 'location':
      return message.location && describeLocation(message.location);
    case 'interactive': {
      const reply =
        message.interactive?.button_reply || message.interactive?.list_reply;

      return reply?.title;
    }
    case 'button':
      return message.button?.text;
    case 'contacts':
      return message.contacts?.length
        ? describeContacts(message.contacts)
        : undefined;
    default:
      return undefined;
  }
};

/**
 * Maps a webhook message to inbox text and an optional media reference.
 * Returns null for events that are not conversation messages (reactions).
 */
export const describeWhatsappMessage = (
  message: WhatsappWebhookMessage,
): IWhatsappInboundContent | null => {
  if (message.type === 'reaction') return null;

  const media = describeMedia(message);

  if (media) return media;

  const text = describeText(message);

  return {
    text:
      text ??
      `This WhatsApp message type (${message.type}) can't be shown in erxes. Open WhatsApp to view it.`,
  };
};

export const whatsappTextToHtml = (text: string): string =>
  escapeHtml(text).replace(/\n/g, '<br>');

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const MAX_CODE_POINT = 0x10ffff;

const decodeEntities = (text: string) =>
  text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code.startsWith('#')) {
      const value = /^#x/i.test(code)
        ? Number.parseInt(code.slice(2), 16)
        : Number.parseInt(code.slice(1), 10);

      // fromCodePoint throws past the last Unicode code point.
      return Number.isFinite(value) && value <= MAX_CODE_POINT
        ? String.fromCodePoint(value)
        : entity;
    }

    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });

/**
 * Converts composer HTML to WhatsApp text, keeping bold, italic and strike
 * formatting. Tag bodies exclude `<` so every pattern runs in linear time.
 */
export const htmlToWhatsappText = (html: string): string =>
  decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<li[^<>]*>/gi, '• ')
      .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, '\n')
      .replace(/<\/?(strong|b)(\s[^<>]*)?>/gi, '*')
      .replace(/<\/?(em|i)(\s[^<>]*)?>/gi, '_')
      .replace(/<\/?(s|del|strike)(\s[^<>]*)?>/gi, '~')
      .replace(/<[^<>]*>/g, ''),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();

/** Splits text into WhatsApp-sized parts, preferring line then word boundaries. */
export const splitWhatsappText = (text: string, limit: number): string[] => {
  const parts: string[] = [];
  let rest = text.trim();

  while (rest.length > limit) {
    const window = rest.slice(0, limit);
    const breakAt = Math.max(window.lastIndexOf('\n'), window.lastIndexOf(' '));
    const cut = breakAt > limit / 2 ? breakAt : limit;

    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  if (rest) parts.push(rest);

  return parts;
};

/** WhatsApp accepts only some formats per media type; everything else goes as a document. */
export const getOutgoingMediaType = (
  mimeType: string,
): 'image' | 'video' | 'audio' | 'document' => {
  const type = mimeType.toLowerCase();

  if (type === 'image' || /^image\/(jpeg|png)$/.test(type)) return 'image';
  if (/^video\/(mp4|3gpp)$/.test(type)) return 'video';
  if (/^audio\/(aac|amr|mpeg|mp4|ogg)$/.test(type)) return 'audio';

  return 'document';
};
