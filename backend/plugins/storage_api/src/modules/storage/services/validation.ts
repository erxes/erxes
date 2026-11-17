import { randomBytes, randomUUID } from 'crypto';

/** Upper bounds that keep one request from exhausting memory or the database. */
export const LIMITS = {
  MAX_REGISTER_TAGS: 5000,
  MAX_BREAK_BOXES: 200,
  MAX_SCAN_EPCS: 50000,
  MAX_UNITS_IN_PACK: 100000,
  INSERT_CHUNK: 500,
  SCAN_SAMPLE: 200,
  MAX_PER_PAGE: 200,
};

export class StorageInputError extends Error {}

const EPC_PATTERN = /^[0-9A-F]{24}$/;

export const assertPositiveInt = (value: unknown, field: string, max: number) => {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > max) {
    throw new StorageInputError(`${field} нь 1-${max} хооронд бүхэл тоо байх ёстой.`);
  }
};

export const assertRequired = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new StorageInputError(`${field} заавал байх ёстой.`);
  }
};

/** Upper-cases, trims and de-duplicates EPC ids; rejects anything that is not a 96-bit hex EPC. */
export const normalizeEpcIds = (input: unknown, max: number): string[] => {
  if (!Array.isArray(input) || input.length === 0) {
    throw new StorageInputError('EPC жагсаалт хоосон байна.');
  }
  if (input.length > max) {
    throw new StorageInputError(`Нэг удаад ${max}-аас их EPC илгээж болохгүй.`);
  }

  const epcIds = [...new Set(input.map((e) => String(e).trim().toUpperCase()))];
  const invalid = epcIds.find((e) => !EPC_PATTERN.test(e));

  if (invalid !== undefined) {
    throw new StorageInputError(`"${invalid}" нь 24 тэмдэгттэй hex EPC биш байна.`);
  }

  return epcIds;
};

/** 96-bit EPC as 24 upper-case hex characters (standard UHF Gen2 length). */
export const newEpcId = () => randomBytes(12).toString('hex').toUpperCase();

export const newId = () => randomUUID();

export const isDuplicateKeyError = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: number }).code === 11000;

export const pageOf = (page?: number | null, perPage?: number | null) => {
  const size = Math.min(Math.max(Math.trunc(perPage || 20), 1), LIMITS.MAX_PER_PAGE);
  const index = Math.max(Math.trunc(page || 1), 1);
  return { limit: size, skip: (index - 1) * size };
};
