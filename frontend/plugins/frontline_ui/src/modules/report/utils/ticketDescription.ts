import { stripHtml } from 'erxes-ui';

const blockText = (value: unknown, separator = ''): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value))
    return value.map((item) => blockText(item)).join(separator);
  if (!value || typeof value !== 'object') return '';
  if ('text' in value && typeof value.text === 'string') return value.text;
  return [
    'content' in value ? blockText(value.content) : '',
    'children' in value ? blockText(value.children, ' ') : '',
  ]
    .filter(Boolean)
    .join(' ');
};

export const ticketDescriptionText = (description?: string): string => {
  if (!description) return '';
  let text = description;
  try {
    const parsed: unknown = JSON.parse(description);
    if (Array.isArray(parsed)) text = blockText(parsed, ' ');
  } catch {
    // Legacy descriptions may be plain text or HTML.
  }
  return stripHtml(text).replace(/\s+/g, ' ').trim();
};
