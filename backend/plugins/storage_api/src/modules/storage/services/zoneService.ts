import { IStorageZone, IZoneLocation } from '../@types/storage';
import { IModels } from '../db/models/Storage';
import { assertRequired, isDuplicateKeyError, StorageInputError } from './validation';

export interface IZoneInput {
  _id?: string | null;
  name: string;
  sealed: IZoneLocation;
  open: IZoneLocation;
}

const assertLocation = (location: IZoneLocation | undefined, label: string) => {
  assertRequired(location?.accountId, `${label}: бараа материалын данс`);
  assertRequired(location?.branchId, `${label}: салбар`);
  assertRequired(location?.departmentId, `${label}: хэлтэс`);
};

const sameLocation = (a: IZoneLocation, b: IZoneLocation) =>
  a.accountId === b.accountId && a.branchId === b.branchId && a.departmentId === b.departmentId;

export const saveZone = async (models: IModels, input: IZoneInput) => {
  assertRequired(input.name, 'Бүсийн нэр');
  assertLocation(input.sealed, 'Битүү бүс');
  assertLocation(input.open, 'Задгай бүс');

  if (sameLocation(input.sealed, input.open)) {
    throw new StorageInputError('Битүү ба задгай бүс ижил данс, салбар, хэлтэстэй байж болохгүй.');
  }

  const doc: IStorageZone = { name: input.name.trim(), sealed: input.sealed, open: input.open };

  try {
    if (!input._id) return (await models.Zones.create(doc)).toObject();

    const updated = await models.Zones.findOneAndUpdate({ _id: input._id }, { $set: doc }, { new: true }).lean();
    if (!updated) throw new StorageInputError('Бүс олдсонгүй.');
    return updated;
  } catch (e) {
    if (isDuplicateKeyError(e)) throw new StorageInputError(`"${doc.name}" нэртэй бүс аль хэдийн байна.`);
    throw e;
  }
};

export const removeZone = async (models: IModels, zoneId: string) => {
  const inUse = await models.RfidTags.exists({ zoneId });
  if (inUse) throw new StorageInputError('Энэ бүсэд RFID ялтас бүртгэлтэй байна. Эхлээд ялтсуудыг устгана уу.');

  const res = await models.Zones.deleteOne({ _id: zoneId });
  if (res.deletedCount === 0) throw new StorageInputError('Бүс олдсонгүй.');
  return zoneId;
};

export const requireZone = async (models: IModels, zoneId: string) => {
  const zone = await models.Zones.findById(zoneId).lean();
  if (!zone) throw new StorageInputError('Бүс олдсонгүй.');
  return zone;
};
