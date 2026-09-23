import { stripHtml } from 'string-strip-html';
import { splitQuotedReply } from '@/integrations/mail/utils/thread';

const MAIL_TAG_NAMES = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'font',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'script',
  'span',
  'strong',
  'style',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
];

const MAIL_TAG = new RegExp(
  `<\\/?(${MAIL_TAG_NAMES.join('|')})(?=[\\s/>])[^>]*>`,
  'i',
);

const LINE_BREAK_TAG = /<br\s*\/?>/gi;

const PARAGRAPH_END_TAG = /<\/p>/gi;

const BLOCK_END_TAG = /<\/(div|li|tr|h[1-6]|blockquote)>/gi;

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const htmlToText = (html: string, onlyStripTags: string[] = []) => {
  const withLineBreaks = html
    .replace(LINE_BREAK_TAG, '\n')
    .replace(PARAGRAPH_END_TAG, '\n\n')
    .replace(BLOCK_END_TAG, '\n');

  return stripHtml(withLineBreaks, {
    onlyStripTags,
    dumpLinkHrefsNearby: { enabled: true },
  })
    .result.trim()
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
};

export const htmlToContextText = (html: string) => {
  const { newContent } = splitQuotedReply(html);

  return htmlToText(newContent ?? html);
};

export const toMailHtml = (content: string) => {
  const text = MAIL_TAG.test(content)
    ? htmlToText(content, MAIL_TAG_NAMES)
    : content;

  return text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`,
    )
    .join('');
};
