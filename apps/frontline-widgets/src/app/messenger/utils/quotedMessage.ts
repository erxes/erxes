import type { IAttachment } from '../types';

type ParsedMessageContent = {
  reply?: {
    author: string;
    preview: string;
  };
  cleanHtml: string;
};

const decodeHtmlEntities = (value: string): string =>
  new DOMParser().parseFromString(value, 'text/html').body.textContent || '';

const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[character] || character),
  );

export const buildQuotedMessage = (
  authorName: string,
  preview: string,
  message: string,
): string =>
  `<blockquote><strong>Replying to ${escapeHtml(authorName)}</strong><br/>${escapeHtml(preview)}</blockquote>${message}`;

export function parseQuotedMessage(html?: string): ParsedMessageContent {
  if (!html) return { cleanHtml: '' };

  const replyMatch = html.match(
    /^<blockquote><strong>Replying to(?:\s+([^<]+))?<\/strong><br\s*\/?>([\s\S]*?)<\/blockquote>/i,
  );

  if (!replyMatch) return { cleanHtml: html };

  return {
    reply: {
      author: decodeHtmlEntities(replyMatch[1]?.trim() || 'a message'),
      preview: decodeHtmlEntities(
        replyMatch[2]
          .replace(/<[^<>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim(),
      ),
    },
    cleanHtml: html.slice(replyMatch[0].length).trim(),
  };
}

export function getMessageText(
  content?: string,
  attachments?: IAttachment[],
): string {
  if (content && content !== '<p></p>') {
    const { cleanHtml } = parseQuotedMessage(content);
    const parsed = new DOMParser().parseFromString(cleanHtml, 'text/html');
    const text = (parsed.body.textContent || '').replace(/\s+/g, ' ').trim();
    if (text) return text;
  }

  return attachments?.map(({ name }) => name || 'Attachment').join(', ') || '';
}

export const hasMessageContent = (content?: string | null): content is string =>
  !!content &&
  (/<blockquote[\s\S]*?<\/blockquote>/i.test(content) ||
    Boolean(content.replace(/<[^>]*>/g, '').replace(/\s|&nbsp;/g, '')));
