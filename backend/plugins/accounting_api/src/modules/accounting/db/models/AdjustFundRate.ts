import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IAdjustFundRate,
  IAdjustFundRateDocument,
} from '../../@types/adjustRateFundDetails';
import { adjustFundRatesSchema } from '../../db/definitions/adjustFundRate';

export interface IAdjustFundRatesModels extends Model<IAdjustFundRateDocument> {
  getAdjustFundRate(_id: string): Promise<IAdjustFundRate>;
  getAdjustFundRates(selecter: any): Promise<IAdjustFundRate[]>;
  createAdjustFundRate(doc: IAdjustFundRate): Promise<IAdjustFundRateDocument>;
  updateAdjustFundRate(
    _id: string,
    doc: Partial<IAdjustFundRate>,
  ): Promise<IAdjustFundRate>;
  removeAdjustFundRate(_id: string): Promise<string>;
}
export const loadAdjustRatesClass = (models: IModels) => {
  class AdjustFundRates {
    public static async getAdjustFundRate(_id: string) {
      const adjusting = await models.AdjustFundRates.findOne({ _id }).lean();
      if (!adjusting) {
        throw new Error('Adjusting not found');
      }
      return adjusting;
    }

    public static async getAdjustFundRates(selector: any = {}) {
      return models.AdjustFundRates.find(selector)
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async createAdjustFundRate(doc: IAdjustFundRate) {
      return models.AdjustFundRates.create({ ...doc, createdAt: new Date() });
    }

    public static async updateAdjustFundRate(
      _id: string,
      doc: Partial<IAdjustFundRate>,
    ) {
      await models.AdjustFundRates.getAdjustFundRate(_id);
      await models.AdjustFundRates.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
        { new: true },
      ).lean();
      return await models.AdjustFundRates.getAdjustFundRate(_id);
    }

    public static async removeAdjustFundRate(_id: string) {
      await models.AdjustFundRates.getAdjustFundRate(_id);

      await models.AdjustFundRates.deleteOne({ _id });
      return 'success delete';
    }
  }

  adjustFundRatesSchema.loadClass(AdjustFundRates);

  return adjustFundRatesSchema;
};
