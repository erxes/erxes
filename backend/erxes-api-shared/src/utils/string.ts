import * as crypto from 'crypto';

export const stripAnsi = async (str: string) => {
  let stripAnsiModule: ((str: string) => string) | null = null;

  if (!stripAnsiModule) {
    const { default: imported } = await import('strip-ansi');
    stripAnsiModule = imported;
  }
  return stripAnsiModule(str);
};

/**
 * Removes the last trailing slash from a string if it exists.
 *
 * @param text - the string to remove the trailing slash from
 * @returns the modified string with the trailing slash removed
 */
export const removeLastTrailingSlash = (text: string) => {
  return text.replace(/\/$/, '');
};

/**
 * Replaces multiple whitespace characters in a string with a single space and trims
 * the string of leading and trailing whitespace.
 *
 * @param text - the string to remove extra spaces from
 * @returns the modified string with extra spaces removed
 */
export const removeExtraSpaces = (text: string) => {
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * Checks if the given string is a valid URL.
 *
 * @param url - the string to check
 * @returns true if the string is a valid URL, false otherwise
 */
export const isValidURL = (url: string): boolean => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

/**
 * Splits text into chunks of strings limited by the given character count.
 *
 * Regex explanation:
 * .{1,100}(\\s|$)
 * - .         → matches any character (except line terminators)
 * - {1,100}   → matches 1 to 100 of the preceding token
 * - (\\s|$)   → ends with a whitespace OR end of string
 *
 * @param str - Text to be split
 * @param size - Character length of each chunk
 * @returns An array of string chunks
 */
export const splitStr = async (
  str: string,
  size: number,
): Promise<string[]> => {
  const cleanStr = await stripAnsi(str);

  const regex = new RegExp(`.{1,${size}}(\\s|$)`, 'g');

  return cleanStr.match(regex) || [];
};

/**
 * Cleans the given HTML content by removing ANSI escape codes
 * and truncating the result to a maximum of 100 characters.
 *
 * @param content - The HTML content to be cleaned.
 * @returns The cleaned content as a string.
 */

export const cleanHtml = async (content?: string): Promise<string> =>
  (await stripAnsi(content || '')).substring(0, 100);

/**
 * Escapes a string so that it can be used in a regular expression.
 * This escapes all characters that have special meanings in regular
 * expressions, so that the string can be used verbatim in a regular
 * expression.
 *
 * @param {string} str the string to escape
 * @returns {string} the escaped string

/**
 * Takes an array of strings and returns a single string that is
 * suitable for use as a search query. The function trims the
 * resulting string to 512 characters if it is longer than that.
 *
 * @param {string[]} values an array of strings to join
 * @returns {string} a single string suitable for use as a search query
 */

/**
 * Generates a random string of a given length using a given pattern.
 *
 * The pattern string can contain the following special characters:
 * - `a`: lowercase letters
 * - `A`: uppercase letters
 * - `0`: numbers
 * - `!`: special characters
 *
 * Any other characters in the pattern string are interpreted as literal
 * characters and are included in the resulting string.
 *
 * If no valid pattern is provided, the function throws an error.
 *
 * @param {string} pattern the pattern to use when generating the string
 * @param {number} length the length of the resulting string
 * @returns {string} the generated string
 */
export const random = (pattern: string, length: number) => {
  const maskMap: Record<string, string> = {
    a: 'abcdefghijklmnopqrstuvwxyz',
    A: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0': '0123456789',
    '!': '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\',
  };

  let chars = '';

  for (const char of pattern) {
    if (maskMap[char]) {
      chars += maskMap[char];
    } else {
      chars += char;
    }
  }

  if (!chars) throw new Error('No valid pattern provided.');

  let result = '';

  const maxByte = 255;
  const maxMultiple = Math.floor(maxByte / chars.length) * chars.length;

  while (result.length < length) {
    const randomBytes = crypto.randomBytes(1);
    const randomValue = randomBytes[0];

    if (randomValue < maxMultiple) {
      result += chars[randomValue % chars.length];
    }
  }

  return result;
};
