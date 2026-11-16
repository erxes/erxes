import { randomBytes, randomUUID } from 'crypto';

/** Upper bounds that keep a single request from exhausting memory or locking the DB. */
export const LIMITS = {
  MAX_RECEIVE_PACKS: 5000,
  MAX_OPEN_UNITS: 1_000_000,
  MAX_ISSUE_QTY: 1_000_000,
  MAX_TOOL_ASSETS_PER_ISSUE: 500,
  MAX_MANUAL_VAT_PAYABLES: 100,
  RFID_INSERT_CHUNK: 500,
  VAT_AUTO_BATCH: 500,
  VAT_AUTO_CONCURRENCY: 25,
  CAS_RETRIES: 5,
};

/** Tolerances in MNT used when matching e-Barimt receipts to payables. */
export const VAT_TOLERANCE = {
  AUTO_VAT: 1,
  AUTO_AMOUNT: 10,
  MANUAL_VAT: 5,
};

export class StorageInputError extends Error {}

export const assertPositiveInt = (value: unknown, field: string, max: number) => {
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > max) {
    throw new StorageInputError(`${field} нь 1-${max} хооронд бүхэл тоо байх ёстой.`);
  }
};

export const assertNonNegativeInt = (value: unknown, field: string, max: number) => {
  if (!Number.isInteger(value) || (value as number) < 0 || (value as number) > max) {
    throw new StorageInputError(`${field} нь 0-${max} хооронд бүхэл тоо байх ёстой.`);
  }
};

export const assertPositiveNumber = (value: unknown, field: string, max: number) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0 || value > max) {
    throw new StorageInputError(`${field} нь 0-ээс их, ${max}-аас ихгүй тоо байх ёстой.`);
  }
};

export const assertNonNegativeNumber = (value: unknown, field: string) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new StorageInputError(`${field} сөрөг байж болохгүй.`);
  }
};

export const parseTxDate = (value?: Date | string | null): Date => {
  if (value === undefined || value === null) return new Date();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new StorageInputError('Гүйлгээний огноо буруу байна.');
  return date;
};

/** 96-bit EPC as 24 upper-case hex chars (standard UHF Gen2 EPC length). */
export const newEpcId = () => randomBytes(12).toString('hex').toUpperCase();

export const newAssetCode = () => `TOOL-${randomBytes(5).toString('hex').toUpperCase()}`;

export const newSerialNo = () => `SN-${randomBytes(4).toString('hex').toUpperCase()}`;

export const newGroupId = (prefix: string) => `${prefix}-${randomUUID()}`;

export const newRequestKey = () => randomUUID();

export const isDuplicateKeyError = (e: unknown) =>
  typeof e === 'object' && e !== null && (e as { code?: number }).code === 11000;
