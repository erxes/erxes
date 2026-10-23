import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ICleaningDocument } from '@/pms/@types/cleanings';
import { cleaningSchema } from '@/pms/db/definitions/cleanings';

export interface ICleaningModel extends Model<ICleaningDocument> {
  getCleaning(_id: string): Promise<ICleaningDocument>;
  remove(ids: string[]): Promise<any>;
}

export const loadCleaningClass = (models: IModels) => {
  class Cleaning {
    public static async getCleaning(_id: string) {
      return await models.Cleaning.findById(_id);
    }
    public static async remove(ids: string[]) {
      await models.Cleaning.deleteMany({ _id: { $in: ids } });
      return 'ok';
    }
  }

  cleaningSchema.loadClass(Cleaning);

  return cleaningSchema;
};
