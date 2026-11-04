import { IWebTexts } from '@/webbuilder/@types/web';

const MAX_DEPTH = 5;
const MAX_BYTES = 512 * 1024;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype;

const validateLevel = (
  value: Record<string, unknown>,
  path: string,
  depth: number,
): IWebTexts => {
  if (depth > MAX_DEPTH) {
    throw new Error(`texts cannot be nested deeper than ${MAX_DEPTH} levels`);
  }

  const result: IWebTexts = {};

  for (const [key, entry] of Object.entries(value)) {
    const keyPath = path ? `${path}.${key}` : key;

    // MongoDB reserves "$"-prefixed names and treats "." as a path separator
    if (!key || key.startsWith('$') || key.includes('.')) {
      throw new Error(
        `Invalid texts key "${keyPath}": keys must be non-empty and cannot start with "$" or contain "."`,
      );
    }

    if (typeof entry === 'string') {
      result[key] = entry;
    } else if (isPlainObject(entry)) {
      result[key] = validateLevel(entry, keyPath, depth + 1);
    } else {
      throw new Error(
        `Invalid texts value at "${keyPath}": expected a string or an object`,
      );
    }
  }

  return result;
};

/**
 * Validates a whole texts map before it replaces the stored one.
 * `undefined` leaves the stored map untouched; `null` clears it.
 */
export const normalizeWebTexts = (
  texts: unknown,
): IWebTexts | undefined => {
  if (texts === undefined) {
    return undefined;
  }

  if (texts === null) {
    return {};
  }

  if (!isPlainObject(texts)) {
    throw new Error('texts must be an object');
  }

  const normalized = validateLevel(texts, '', 1);

  if (Buffer.byteLength(JSON.stringify(normalized)) > MAX_BYTES) {
    throw new Error(`texts cannot exceed ${MAX_BYTES / 1024}KB`);
  }

  return normalized;
};
