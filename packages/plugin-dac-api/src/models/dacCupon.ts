import { Model } from 'mongoose';
import {
  cuponSchema,
  ICuponCreate,
  ICuponDocument,
  IModels
} from './definitions/cupon';

export interface ICuponModel extends Model<ICuponDocument> {
  checkCupon(customerId: string, cuponCode: string): Promise<ICuponDocument>;
  createCupon(
    docFields: ICuponCreate,
    userId?: string
  ): Promise<ICuponDocument>;
  updateExpiryCupons(): Promise<ICuponDocument>;
  removeDoc(chapterId: string): void;
}
export const loadCuponClass = (model: IModels) => {
  class Cupon {
    public static async checkCupon(customerId: string, cuponCode: string) {
      const newCupon = await model.DacCupons.find({
        customerId,
        cuponCode,
        status: 'new'
      }).sort({
        expireDate: 1
      });

      if (newCupon.length > 0) {
        return newCupon?.[0];
      }

      const oldCupon = await model.DacCupons.find({
        customerId,
        cuponCode,
        status: {
          $ne: 'new'
        }
      }).sort({
        expireDate: 1
      });
      if (oldCupon.length > 0) {
        return oldCupon?.[0];
      }
      throw new Error('Dac cupon not found');
    }

    /**
     * Create LmsChapter document
     */
    public static async createCupon(docFields: ICuponCreate, userId: string) {
      if (!userId) {
        throw new Error('User not found');
      }

      const cupon = await model.DacCupons.create({
        ...docFields,
        status: 'new',
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });
      return cupon;
    }

    /**
     * Update LmsChapter document
     */
    public static async updateExpiryCupons() {
      const now = new Date();

      await model.DacCupons.updateMany(
        { expireDate: { $lte: now }, status: 'new' },
        {
          $set: {
            status: 'expired',
            modifiedBy: 'by Cron',
            modifiedDate: new Date()
          }
        }
      );
      return 'runned';
    }
  }

  cuponSchema.loadClass(Cupon);

  return cuponSchema;
};
