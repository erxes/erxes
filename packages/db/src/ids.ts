import { randomBytes } from 'node:crypto';

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Text ids, 17 characters, in the style of old erxes ids so records imported
 * from Mongo keep their `_id` unchanged and references stay valid.
 */
export const newId = (length = 17): string => {
  let id = '';

  for (const byte of randomBytes(length)) id += ALPHABET.charAt(byte % ALPHABET.length);

  return id;
};
