import { randomFillSync } from 'node:crypto';

// nanoid v3's default (url-safe) alphabet. The ids generated here end up in
// Mongo `_id` fields next to documents the API itself created, and the API
// defaults those to `nanoid()`, so the shape has to match exactly: 21
// characters drawn from this 64-character set.
const ID_ALPHABET =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

const DEFAULT_ID_SIZE = 21;

export const generateId = (size: number = DEFAULT_ID_SIZE): string => {
  const bytes = randomFillSync(new Uint8Array(size));
  let id = '';

  for (let index = 0; index < size; index++) {
    // The alphabet is exactly 64 characters, so masking to the low 6 bits
    // keeps the distribution uniform without any rejection sampling.
    id += ID_ALPHABET[bytes[index] & 63];
  }

  return id;
};

// The API prefixes every stored file name with `randomAlphanumeric()` from
// erxes-api-shared, which is nanoid over this 62-character alphabet at the
// same default length. Uploaded keys have to keep that shape so files written
// by this migration are indistinguishable from ones the app uploaded.
const ALPHANUMERIC =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const randomAlphanumeric = (size: number = DEFAULT_ID_SIZE): string => {
  let id = '';

  // 62 is not a power of two, so drawing 6 bits and discarding the two
  // out-of-range values keeps every character equally likely. This is the same
  // rejection loop nanoid's customAlphabet uses.
  while (id.length < size) {
    const bytes = randomFillSync(new Uint8Array(size));

    for (const byte of bytes) {
      const index = byte & 63;

      if (index < ALPHANUMERIC.length) {
        id += ALPHANUMERIC[index];

        if (id.length === size) {
          break;
        }
      }
    }
  }

  return id;
};
