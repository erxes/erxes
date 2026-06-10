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

/**
 * Build a URL-safe slug from a post title. Mongolian Cyrillic characters are
 * transliterated to Latin, the rest is normalized to `[a-z0-9-]`, and the
 * result is capped at `maxLength` characters without breaking the final word.
 */
export const createSlug = (title: string, maxLength = 60): string => {
  let slug = String(title ?? '')
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Cut to maxLength without breaking the last word when possible.
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    const lastDash = slug.lastIndexOf('-');
    if (lastDash > 0) {
      slug = slug.slice(0, lastDash);
    }
    slug = slug.replace(/-+$/, '');
  }

  return slug;
};
