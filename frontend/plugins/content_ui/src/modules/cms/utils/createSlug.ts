const MONGOLIAN_CYRILLIC_PAIRS = [
  ['а', 'a'],
  ['б', 'b'],
  ['в', 'v'],
  ['г', 'g'],
  ['д', 'd'],
  ['е', 'e'],
  ['ё', 'yo'],
  ['ж', 'j'],
  ['з', 'z'],
  ['и', 'i'],
  ['й', 'i'],
  ['к', 'k'],
  ['л', 'l'],
  ['м', 'm'],
  ['н', 'n'],
  ['о', 'o'],
  ['ө', 'u'],
  ['п', 'p'],
  ['р', 'r'],
  ['с', 's'],
  ['т', 't'],
  ['у', 'u'],
  ['ү', 'u'],
  ['ф', 'f'],
  ['х', 'kh'],
  ['ц', 'ts'],
  ['ч', 'ch'],
  ['ш', 'sh'],
  ['щ', 'shch'],
  ['ъ', ''],
  ['ы', 'y'],
  ['ь', ''],
  ['э', 'e'],
  ['ю', 'yu'],
  ['я', 'ya'],
] as const;

const cyrillicToLatin = new Map<string, string>(MONGOLIAN_CYRILLIC_PAIRS);
const MONGOLIAN_CYRILLIC_PATTERN = /[абвгдеёжзийклмнопрстуүфхцчшщъыьэюяө]/gu;
const DEFAULT_SLUG_MAX_LENGTH = 60;
const FALLBACK_SLUG = 'untitled';

const getSlugMaxLength = (maxLength: number) =>
  Number.isInteger(maxLength) && maxLength > 0
    ? maxLength
    : DEFAULT_SLUG_MAX_LENGTH;

const removeEndingHyphens = (slug: string) => {
  let endIndex = slug.length;

  while (slug.charAt(endIndex - 1) === '-') {
    endIndex -= 1;
  }

  return slug.slice(0, endIndex);
};

const truncateSlug = (slug: string, maxLength: number) => {
  if (slug.length <= maxLength) {
    return slug;
  }

  const slicedSlug = slug.slice(0, maxLength);
  const lastWordSeparator = slicedSlug.lastIndexOf('-');
  const truncatedSlug =
    lastWordSeparator > 0 ? slicedSlug.slice(0, lastWordSeparator) : slicedSlug;

  return (
    removeEndingHyphens(truncatedSlug) || FALLBACK_SLUG.slice(0, maxLength)
  );
};

/**
 * Build a URL-safe slug from a CMS name or title. Keep this behavior aligned
 * with the backend CMS slug utility.
 */
export const createSlug = (
  title: string | null | undefined,
  maxLength = DEFAULT_SLUG_MAX_LENGTH,
): string => {
  const normalizedSlug = String(title ?? '')
    .toLowerCase()
    .replace(
      MONGOLIAN_CYRILLIC_PATTERN,
      (char) => cyrillicToLatin.get(char) ?? char,
    )
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .replace(/[^a-z0-9\s-]/gu, '')
    .trim()
    .replace(/\s+/gu, '-');

  const compactSlug =
    normalizedSlug
      .split('-')
      .reduce<string[]>((parts, part) => {
        if (part) parts.push(part);
        return parts;
      }, [])
      .join('-') || FALLBACK_SLUG;

  return truncateSlug(compactSlug, getSlugMaxLength(maxLength));
};
