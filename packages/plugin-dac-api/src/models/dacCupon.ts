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
      const cupon = await model.DacCupons.findOne({ customerId, cuponCode });
      if (!cupon) {
        throw new Error('Dac cupon not found');
      }

      return cupon;
    }

    /**
     * Create LmsChapter document
     */
    public static async createCupon(docFields: ICuponCreate, userId: string) {
      const { cuponCode, customerId } = docFields;
      if (!userId) {
        throw new Error('User not found');
      }
      const isExists = await model.DacCupons.findOne({ customerId, cuponCode });

      if (isExists) {
        throw new Error('Already exists');
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
