import { IRfidTag, IStorageMovement, IStorageMovementItem } from '../@types/storage';
import { IModels } from '~/connectionResolvers';
import { bookMovement } from './accountingService';
import { isDuplicateKeyError, LIMITS, newId, normalizeEpcIds, StorageInputError } from './validation';
import { requireZone } from './zoneService';

export interface IBreakBoxesInput {
  epcIds: string[];
  /** Client-generated key; a retry with the same key returns the first movement. */
  requestKey?: string | null;
}

type TagSnapshot = Pick<IRfidTag, 'epcId' | 'productId' | 'unitsInPack' | 'zoneId' | 'status'>;

/** Groups tags into one movement line per product. */
export const itemsFromTags = (tags: TagSnapshot[]): IStorageMovementItem[] => {
  const byProduct = new Map<string, IStorageMovementItem>();

  tags.forEach((tag) => {
    const item = byProduct.get(tag.productId) || { productId: tag.productId, quantity: 0, epcIds: [] };
    item.quantity += tag.unitsInPack;
    item.epcIds.push(tag.epcId);
    byProduct.set(tag.productId, item);
  });

  return [...byProduct.values()];
};

const assertBreakable = (tags: TagSnapshot[], epcIds: string[]) => {
  const found = new Set(tags.map((t) => t.epcId));
  const missing = epcIds.filter((e) => !found.has(e));
  if (missing.length) throw new StorageInputError(`Бүртгэлгүй EPC: ${missing.slice(0, 5).join(', ')}`);

  const opened = tags.filter((t) => t.status !== 'SEALED');
  if (opened.length) {
    throw new StorageInputError(`Аль хэдийн задарсан: ${opened.slice(0, 5).map((t) => t.epcId).join(', ')}`);
  }

  if (new Set(tags.map((t) => t.zoneId)).size > 1) {
    throw new StorageInputError('Нэг удаад зөвхөн нэг бүсийн хайрцгуудыг задална.');
  }
};

/**
 * Moves sealed packs to the open area of their zone.
 *
 * Storage flips the tags and records the movement, then sends the movement to
 * accounting_api over tRPC as an inventory-move transaction. If accounting
 * fails, the tags stay opened and the movement keeps the error so it can be
 * re-sent.
 */
export const breakBoxes = async (
  models: IModels,
  subdomain: string,
  input: IBreakBoxesInput,
  userId?: string,
) => {
  const epcIds = normalizeEpcIds(input.epcIds, LIMITS.MAX_BREAK_BOXES);
  const requestKey = input.requestKey || newId();

  const replay = await models.Movements.findOne({ requestKey }).lean();
  if (replay) return replay;

  const tags = await models.RfidTags.find({ epcId: { $in: epcIds } }).lean();
  assertBreakable(tags, epcIds);

  const zone = await requireZone(models, tags[0].zoneId);
  const movementId = await createMovement(models, {
    requestKey,
    zoneId: String(zone._id),
    source: zone.sealed,
    destination: zone.open,
    items: itemsFromTags(tags),
    userId,
  });

  if (!movementId) {
    // Another request with the same key won the race.
    return models.Movements.findOne({ requestKey }).lean();
  }

  const claimed = await models.RfidTags.updateMany(
    { epcId: { $in: epcIds }, status: 'SEALED' },
    { $set: { status: 'OPENED', movementId } },
  );

  if (claimed.modifiedCount !== epcIds.length) {
    await models.RfidTags.updateMany({ movementId, status: 'OPENED' }, { $set: { status: 'SEALED' }, $unset: { movementId: 1 } });
    await models.Movements.deleteOne({ _id: movementId });
    throw new StorageInputError('Зарим хайрцаг зэрэг задлагдсан байна. Дахин оролдоно уу.');
  }

  const movement = await models.Movements.findOne({ _id: movementId }).lean();
  if (!movement) throw new StorageInputError('Хөдөлгөөн олдсонгүй.');

  return bookMovement(models, subdomain, movement, userId);
};

const createMovement = async (
  models: IModels,
  doc: Pick<IStorageMovement, 'requestKey' | 'zoneId' | 'source' | 'destination' | 'items' | 'userId'>,
): Promise<string | null> => {
  try {
    const created = await models.Movements.create({
      ...doc,
      type: 'BREAK_BOX',
      number: `RFID-${Date.now().toString(36).toUpperCase()}-${doc.requestKey.slice(0, 4).toUpperCase()}`,
      date: new Date(),
      accountingStatus: 'pending',
    });
    return String(created._id);
  } catch (e) {
    if (isDuplicateKeyError(e)) return null;
    throw e;
  }
};

/** Re-sends a movement to accounting, for example after its config was fixed. */
export const retryAccounting = async (
  models: IModels,
  subdomain: string,
  movementId: string,
  userId?: string,
) => {
  const movement = await models.Movements.findOneAndUpdate(
    { _id: movementId, accountingStatus: { $ne: 'success' } },
    { $set: { accountingStatus: 'pending' }, $unset: { accountingResponse: 1 } },
    { new: true },
  ).lean();

  if (!movement) throw new StorageInputError('Дахин илгээх боломжтой хөдөлгөөн олдсонгүй.');

  return bookMovement(models, subdomain, movement, userId);
};
