import { isReferenceHref } from './references';

const SAFE_SCHEMES = new Set(['http:', 'https:', 'mailto:']);

export const replyLink = (url: string): string | null => {
  const trimmed = url.trim();

  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  if (isReferenceHref(trimmed)) return trimmed;

  return URL.canParse(trimmed) && SAFE_SCHEMES.has(new URL(trimmed).protocol) ? trimmed : null;
};
