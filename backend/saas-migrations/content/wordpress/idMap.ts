import { createHash } from 'node:crypto';

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'j',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  ө: 'u',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ү: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const CMS_SLUG_MAX_LENGTH = 60;
const CMS_SLUG_FALLBACK = 'untitled';

const trimCharacter = (value: string, character: string): string => {
  let start = 0;
  let end = value.length;

  while (value[start] === character) {
    start += 1;
  }

  while (end > start && value[end - 1] === character) {
    end -= 1;
  }

  return value.slice(start, end);
};

const trimTrailingCharacter = (value: string, character: string): string => {
  let end = value.length;

  while (end > 0 && value[end - 1] === character) {
    end -= 1;
  }

  return value.slice(0, end);
};

const hashValue = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const limitCmsSlugLength = (slug: string): string => {
  if (slug.length <= CMS_SLUG_MAX_LENGTH) {
    return slug;
  }

  const truncated = slug.slice(0, CMS_SLUG_MAX_LENGTH);
  const lastDash = truncated.lastIndexOf('-');
  const limited = trimTrailingCharacter(
    lastDash > 0 ? truncated.slice(0, lastDash) : truncated,
    '-',
  );

  return limited || CMS_SLUG_FALLBACK;
};

export const normalizeSourceSite = (value: string): string => {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'unknown-wordpress-site';
  }

  try {
    const url = new URL(trimmed);
    url.hash = '';
    url.search = '';
    url.pathname = trimTrailingCharacter(url.pathname, '/') || '/';
    const normalized = url.toString();

    return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  } catch {
    return trimTrailingCharacter(trimmed, '/');
  }
};

export const createWordPressCode = (
  sourceSite: string,
  prefix: string,
): string => `${prefix}_${hashValue(sourceSite).slice(0, 10)}`;

export const normalizeWordPressCode = (value: string): string => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_');
  const trimmed = trimCharacter(normalized, '_');

  return trimmed || 'wordpress_type';
};

export const createCmsSlug = (value: string): string => {
  const normalized =
    Array.from(value.toLowerCase())
      .map((character) => CYRILLIC_TO_LATIN[character] ?? character)
      .join('')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/gu, '')
      .replace(/[^a-z0-9\s-]/gu, '')
      .trim()
      .replace(/\s+/gu, '-')
      .split('-')
      .filter(Boolean)
      .join('-') || CMS_SLUG_FALLBACK;

  return limitCmsSlugLength(normalized);
};

export const normalizeWordPressSlug = (
  value: string,
  fallbackId: string,
): string => {
  const trimmed = trimCharacter(value.trim(), '/');

  if (trimmed) {
    return trimmed;
  }

  return `wordpress-${fallbackId}`;
};
