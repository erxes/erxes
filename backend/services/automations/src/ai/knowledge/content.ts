import type { TKnowledgeContentFormat } from 'erxes-api-shared/utils';

const HTML_BLOCK_TAGS =
  /<\/?(?:article|br|div|h[1-6]|li|p|section|tr|ul|ol)[^>]*>/gi;
const HTML_TAGS = /<[^>]+>/g;
const SCRIPT_AND_STYLE_TAGS =
  /<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

export const normalizeKnowledgeDocumentContent = ({
  content,
  format = 'text',
}: {
  content: string;
  format?: TKnowledgeContentFormat;
}) => {
  if (format !== 'html') {
    return content.trim();
  }

  return decodeHtmlEntities(
    content
      .replace(SCRIPT_AND_STYLE_TAGS, '')
      .replace(HTML_BLOCK_TAGS, '\n')
      .replace(HTML_TAGS, ' '),
  )
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
};
