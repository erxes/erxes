import { randomFillSync } from 'node:crypto';

const ID_ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const DEFAULT_ID_SIZE = 21;

export const generateId = (size: number = DEFAULT_ID_SIZE): string => {
  const bytes = randomFillSync(new Uint8Array(size));
  let id = '';

  for (let index = 0; index < size; index++) {
    id += ID_ALPHABET[bytes[index] & 63];
  }

  return id;
};

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

const trimTrailingCharacter = (value: string, character: string): string => {
  let end = value.length;

  while (end > 0 && value[end - 1] === character) {
    end -= 1;
  }

  return value.slice(0, end);
};

const trimSlashes = (value: string): string => {
  let start = 0;
  let end = value.length;

  while (value[start] === '/') {
    start += 1;
  }

  while (end > start && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(start, end);
};

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

export const createCmsSlug = (value: string): string => {
  const normalized =
    Array.from(value.toLowerCase())
      .map((character) => CYRILLIC_TO_LATIN[character] ?? character)
      .join('')
      .normalize('NFKD')
      .replace(/[̀-ͯ]/gu, '')
      .replace(/[^a-z0-9\s-]/gu, '')
      .trim()
      .replace(/\s+/gu, '-')
      .split('-')
      .filter(Boolean)
      .join('-') || CMS_SLUG_FALLBACK;

  return limitCmsSlugLength(normalized);
};

export const extractDatabaseName = (
  mongoUrl: string,
  fallback = 'erxes',
): string => {
  const schemeIndex = mongoUrl.indexOf('://');

  if (schemeIndex < 1) {
    throw new Error('MONGO_URL or CORE_MONGO_URL is not a valid MongoDB URL.');
  }

  const pathIndex = mongoUrl.indexOf('/', schemeIndex + 3);

  if (pathIndex === -1) {
    return fallback;
  }

  const encodedDatabaseName = mongoUrl.slice(pathIndex + 1).split('?')[0];
  const databaseName = trimSlashes(encodedDatabaseName);

  if (!databaseName) {
    return fallback;
  }

  try {
    return decodeURIComponent(databaseName);
  } catch {
    throw new Error('MONGO_URL or CORE_MONGO_URL is not a valid MongoDB URL.');
  }
};
