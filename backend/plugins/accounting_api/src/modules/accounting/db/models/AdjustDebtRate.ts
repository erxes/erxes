import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IAdjustDebtRate,
  IAdjustDebtRateDocument,
} from '../../@types/adjustDebtRate';
import { adjustDebtRatesSchema } from '../../db/definitions/adjustDebtRate';

export interface IAdjustDebtRatesModels extends Model<IAdjustDebtRateDocument> {
  getAdjustDebtRate(_id: string): Promise<IAdjustDebtRate>;
  getAdjustDebtRates(selecter: any): Promise<IAdjustDebtRate[]>;
  createAdjustDebtRate(doc: IAdjustDebtRate): Promise<IAdjustDebtRateDocument>;
  updateAdjustDebtRate(
    _id: string,
    doc: Partial<IAdjustDebtRate>,
  ): Promise<IAdjustDebtRate>;
  removeAdjustDebtRate(_id: string): Promise<string>;
}
export const loadAdjustDebtRatesClass = (models: IModels) => {
  class AdjustDebtRates {
    public static async getAdjustDebtRate(_id: string) {
      const adjusting = await models.AdjustDebtRates.findOne({ _id }).lean();
      if (!adjusting) {
        throw new Error('Adjusting not found');
      }
      return adjusting;
    }

    public static async getAdjustDebtRates(selector: any = {}) {
      return models.AdjustDebtRates.find(selector)
        .sort({ createdAt: -1 })
        .lean();
    }

    public static async createAdjustDebtRate(doc: IAdjustDebtRate) {
      return models.AdjustDebtRates.create({ ...doc, createdAt: new Date() });
    }

    public static async updateAdjustDebtRate(
      _id: string,
      doc: Partial<IAdjustDebtRate>,
    ) {
      await models.AdjustDebtRates.getAdjustDebtRate(_id);
      await models.AdjustDebtRates.findOneAndUpdate(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } },
        { new: true },
      ).lean();
      return await models.AdjustDebtRates.getAdjustDebtRate(_id);
    }

    public static async removeAdjustDebtRate(_id: string) {
      await models.AdjustDebtRates.getAdjustDebtRate(_id);

      await models.AdjustDebtRates.deleteOne({ _id });
      return 'success delete';
    }
  }

  // @ts-ignore
  adjustDebtRatesSchema.loadClass(AdjustDebtRates);
  return adjustDebtRatesSchema;
};
