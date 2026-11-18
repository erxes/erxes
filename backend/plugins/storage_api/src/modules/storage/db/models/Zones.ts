import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IStorageZoneDocument } from '@/storage/@types/storage';
import { zoneSchema } from '@/storage/db/definitions/zones';
import { StorageInputError } from '@/storage/services/validation';

export interface IZoneModel extends Model<IStorageZoneDocument> {
  getZone(_id: string): Promise<IStorageZoneDocument>;
}

export const loadZoneClass = (_models: IModels, _subdomain: string) => {
  class Zone {
    public static async getZone(this: IZoneModel, _id: string) {
      const zone = await this.findOne({ _id }).lean<IStorageZoneDocument>();
      if (!zone) throw new StorageInputError('Бүс олдсонгүй.');
      return zone;
    }
  }

  zoneSchema.loadClass(Zone);
  return zoneSchema;
};
