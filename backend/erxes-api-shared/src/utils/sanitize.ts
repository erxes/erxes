import * as path from 'path';

const Segmenter = (Intl as any).Segmenter;
const segmenter = new Segmenter(undefined, { granularity: 'grapheme' });

const truncate = (input: string, length: number): string => {
  const segItr = segmenter.segment(input);
  const segArr = Array.from(segItr, ({ segment }) => segment);
  return segArr.slice(0, length).join('');
};

// Use a non-backtracking approach to remove trailing spaces and dots
const removeTrailingSpacesAndDots = (str: string): string => {
  let end = str.length;
  while (end > 0 && (str[end - 1] === ' ' || str[end - 1] === '.')) {
    end--;
  }
  return str.substring(0, end);
};

const illegalRe = /[/?<>\\:*|"]/g;
// eslint-disable-next-line no-control-regex
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

export const sanitizeFilename = (input: string) => {
  if (typeof input !== 'string') {
    throw new Error('Input must be string');
  }

  let sanitized = input
    .replace(illegalRe, '')
    .replace(controlRe, '')
    .replace(reservedRe, '')
    .replace(windowsReservedRe, '');

  sanitized = removeTrailingSpacesAndDots(sanitized);

  return truncate(sanitized, 255);
};

export const sanitizeKey = (key: string): string => {
  // Disallow empty keys
  if (!key) throw new Error('Key cannot be empty');

  // Disallow protocol schemes to prevent external URLs
  if (/^https?:\/\//i.test(key)) {
    throw new Error('Invalid key: protocol scheme not allowed');
  }

  // Disallow path traversal sequences
  if (key.includes('..')) {
    throw new Error('Invalid key: path traversal is not allowed');
  }

  // Allow only alphanumeric, slash, dash, underscore, space, parentheses and dot characters
  // Adjust this regex based on your expected key format
  if (!/^[a-zA-Z0-9/_\-. ()]+$/.test(key)) {
    throw new Error('Invalid key: contains disallowed characters');
  }

  // Normalize the key to remove redundant slashes or segments
  // This uses path.posix to ensure forward slash normalization regardless of OS
  const normalizedKey = path.posix.normalize(key);

  // After normalization, check again for path traversal
  if (normalizedKey.startsWith('..') || normalizedKey.includes('../')) {
    throw new Error('Invalid key: path traversal detected after normalization');
  }

  return normalizedKey;
};
