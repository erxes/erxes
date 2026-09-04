import { stripHtml } from 'string-strip-html';

type ContentImageAttachment = { type: string; url: string };

const IMG_TAG_PATTERN = /<img [^>]*>/g;
const IMG_SRC_PATTERN = /src="([^"]*)"/;

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const sanitizeMessageHtml = (html: string): string => {
  const normalized = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|blockquote)>/gi, '\n');

  return stripHtml(normalized).result.trim();
};

export const appendContentImages = (
  content: string,
  attachments: ContentImageAttachment[],
) => {
  const images = (content.match(IMG_TAG_PATTERN) || [])
    .map((tag) => IMG_SRC_PATTERN.exec(tag)?.[1])
    .filter((image): image is string => Boolean(image));

  images.forEach((url) => attachments.push({ type: 'image', url }));
};
