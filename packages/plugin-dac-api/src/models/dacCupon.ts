import { Model } from 'mongoose';
import {
  cuponSchema,
  ICuponCreate,
  ICuponDocument,
  IModels
} from './definitions/cupon';

export interface ICuponModel extends Model<ICuponDocument> {
  checkCupon(customerId: string, _id: string): Promise<ICuponDocument>;
  createCupon(
    docFields: ICuponCreate,
    userId?: string
  ): Promise<ICuponDocument>;
  updateExpiryCupons(): Promise<ICuponDocument>;
  removeDoc(chapterId: string): void;
}
export const loadCuponClass = (model: IModels) => {
  class Cupon {
    public static async checkCupon(customerId: string, _id: string) {
      const cupon = await model.DacCupons.findOne({
        customerId,
        _id
      });

      if (cupon) {
        return cupon;
      }
      throw new Error('Cupon not found');
    }

    /**
     * Create LmsChapter document
     */
    public static async createCupon(docFields: ICuponCreate, userId: string) {
      if (!userId) {
        throw new Error('User not found');
      }
      const { customerId, _id } = docFields;
      const cupon = await model.DacCupons.findOne({
        customerId,
        _id
      });
      if (cupon) {
        throw new Error('Already exists');
      }

      const result = await model.DacCupons.create({
        ...docFields,
        status: 'new',
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date()
      });
      return result;
    }
  }

  cuponSchema.loadClass(Cupon);

  return cuponSchema;
};
