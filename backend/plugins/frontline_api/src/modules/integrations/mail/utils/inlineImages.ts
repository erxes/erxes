import { randomUUID } from 'node:crypto';
import { IMailAttachmentInput } from '@/integrations/mail/@types/message';

const IMG_SRC = /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi;

const EXTERNAL_SOURCE = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
};

const FALLBACK_TYPE = 'application/octet-stream';

const unescapeAttribute = (value: string) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const typeOf = (key: string) =>
  IMAGE_TYPES[key.split('.').pop()?.toLowerCase() ?? ''] ?? FALLBACK_TYPE;

const nameOf = (key: string) => key.split('/').pop() || key;

export const inlineStorageImages = (
  html: string,
  createId: () => string = randomUUID,
): { html: string; attachments: IMailAttachmentInput[] } => {
  const byKey = new Map<string, IMailAttachmentInput>();

  const rewritten = html.replace(
    IMG_SRC,
    (match, before: string, source: string, after: string) => {
      const key = unescapeAttribute(source).trim();

      if (!key || EXTERNAL_SOURCE.test(key)) {
        return match;
      }

      const existing = byKey.get(key);

      const attachment = existing ?? {
        name: nameOf(key),
        url: key,
        type: typeOf(key),
        contentId: `${createId()}@erxes`,
        disposition: 'inline' as const,
      };

      byKey.set(key, attachment);

      return `${before}cid:${attachment.contentId}${after}`;
    },
  );

  return { html: rewritten, attachments: Array.from(byKey.values()) };
};
