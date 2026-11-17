import { IModels } from '../db/models/Storage';
import {
  assertPositiveInt,
  assertRequired,
  isDuplicateKeyError,
  LIMITS,
  newEpcId,
  newId,
  normalizeEpcIds,
  StorageInputError,
} from './validation';
import { requireZone } from './zoneService';

export interface IRegisterTagsInput {
  productId: string;
  zoneId: string;
  unitsInPack: number;
  /** Generate this many new EPC ids (to be encoded on blank tags)… */
  count?: number | null;
  /** …or register EPC ids that were already read from encoded tags. */
  epcIds?: string[] | null;
}

const insertInChunks = async (
  models: IModels,
  docs: Record<string, unknown>[],
  offset = 0,
): Promise<void> => {
  if (offset >= docs.length) return;
  await models.RfidTags.insertMany(docs.slice(offset, offset + LIMITS.INSERT_CHUNK), { ordered: true });
  return insertInChunks(models, docs, offset + LIMITS.INSERT_CHUNK);
};

const resolveEpcIds = (input: IRegisterTagsInput): string[] => {
  if (input.epcIds?.length) return normalizeEpcIds(input.epcIds, LIMITS.MAX_REGISTER_TAGS);

  assertPositiveInt(input.count, 'Ялтасны тоо', LIMITS.MAX_REGISTER_TAGS);
  return Array.from({ length: input.count as number }, () => newEpcId());
};

/**
 * Registers one RFID tag per sealed pack. All tags of a call share a batchId,
 * so a failed insert (for example a duplicate EPC) removes the whole batch.
 */
export const registerTags = async (models: IModels, input: IRegisterTagsInput, userId?: string) => {
  assertRequired(input.productId, 'Бараа');
  assertPositiveInt(input.unitsInPack, 'Хайрцаг дахь тоо', LIMITS.MAX_UNITS_IN_PACK);
  await requireZone(models, input.zoneId);

  const epcIds = resolveEpcIds(input);
  const batchId = newId();

  const docs = epcIds.map((epcId) => ({
    epcId,
    productId: input.productId,
    unitsInPack: input.unitsInPack,
    zoneId: input.zoneId,
    status: 'SEALED',
    batchId,
    createdBy: userId,
  }));

  try {
    await insertInChunks(models, docs);
  } catch (e) {
    await models.RfidTags.deleteMany({ batchId });
    if (isDuplicateKeyError(e)) {
      throw new StorageInputError('Зарим EPC аль хэдийн бүртгэлтэй байна. Юу ч бүртгэгдээгүй.');
    }
    throw e;
  }

  return { batchId, count: epcIds.length, epcIds };
};

/** Removes tags that were registered by mistake. Opened tags are part of a movement and stay. */
export const removeTags = async (models: IModels, epcIdsInput: string[]) => {
  const epcIds = normalizeEpcIds(epcIdsInput, LIMITS.MAX_REGISTER_TAGS);
  const res = await models.RfidTags.deleteMany({ epcId: { $in: epcIds }, status: 'SEALED' });
  return res.deletedCount;
};
