import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  IExchangeRate,
  IExchangeRateDocument,
  exchangeRateSchema,
} from './definitions/exchangeRate';

export interface IExchangeRateModel extends Model<IExchangeRateDocument> {
  getExchangeRate(selector: any): Promise<IExchangeRateDocument>;
  createExchangeRate(doc: IExchangeRate): Promise<IExchangeRateDocument>;
  updateExchangeRate(_id: string, doc: IExchangeRate): Promise<IExchangeRateDocument>;
  removeExchangeRates(_ids: string[]): Promise<{ n: number; ok: number }>;
}

export const loadExchangeRateClass = (models: IModels, subdomain: string) => {
  class ExchangeRate {
    /**
     *
     * Get ExchangeRateing Cagegory
     */

    public static async getExchangeRate(selector: any) {
      const exchangeRateing = await models.ExchangeRates.findOne(selector).lean();

      if (!exchangeRateing) {
        throw new Error('ExchangeRateing not found');
      }

      return exchangeRateing;
    }

    /**
     * Create a exchangeRateing
     */
    public static async createExchangeRate(doc: IExchangeRate) {
      return models.ExchangeRates.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update ExchangeRateing
     */
    public static async updateExchangeRate(_id: string, doc: IExchangeRate) {
      await models.ExchangeRates.getExchangeRate({ _id });

      await models.ExchangeRates.updateOne({ _id }, { $set: doc });

      return await models.ExchangeRates.findOne({ _id }).lean();
    }

    /**
     * Remove exchangeRateings
     */
    public static async removeExchangeRates(ids: string[]) {
      await models.ExchangeRates.deleteMany({ _id: { $in: ids } });

      return 'success';
    }
  }

  exchangeRateSchema.loadClass(ExchangeRate);

  return exchangeRateSchema;
};

