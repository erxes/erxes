import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { loyaltySchema } from '@/loyalty/db/definitions/loyalty';
import { ILoyalty, ILoyaltyDocument } from '@/loyalty/@types/loyalty';

export interface ILoyaltyModel extends Model<ILoyaltyDocument> {
  getLoyalty(_id: string): Promise<ILoyaltyDocument>;
  getLoyaltys(): Promise<ILoyaltyDocument[]>;
  createLoyalty(doc: ILoyalty): Promise<ILoyaltyDocument>;
  updateLoyalty(_id: string, doc: ILoyalty): Promise<ILoyaltyDocument>;
  removeLoyalty(LoyaltyId: string): Promise<{  ok: number }>;
}

export const loadLoyaltyClass = (models: IModels) => {
  class Loyalty {
    /**
     * Retrieves loyalty
     */
    public static async getLoyalty(_id: string) {
      const Loyalty = await models.Loyalty.findOne({ _id }).lean();

      if (!Loyalty) {
        throw new Error('Loyalty not found');
      }

      return Loyalty;
    }

    /**
     * Retrieves all loyaltys
     */
    public static async getLoyaltys(): Promise<ILoyaltyDocument[]> {
      return models.Loyalty.find().lean();
    }

    /**
     * Create a loyalty
     */
    public static async createLoyalty(doc: ILoyalty): Promise<ILoyaltyDocument> {
      return models.Loyalty.create(doc);
    }

    /*
     * Update loyalty
     */
    public static async updateLoyalty(_id: string, doc: ILoyalty) {
      return await models.Loyalty.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
      );
    }

    /**
     * Remove loyalty
     */
    public static async removeLoyalty(LoyaltyId: string[]) {
      return models.Loyalty.deleteOne({ _id: { $in: LoyaltyId } });
    }
  }

  loyaltySchema.loadClass(Loyalty);

  return loyaltySchema;
};
