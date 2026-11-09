import { ExpectedError, getFullDate } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  CURRENCY_RATE_MANUAL_SOURCE,
  ICurrencyRate,
  ICurrencyRateDocument,
  currencyRateSchema,
} from '@/currencyRates/db/definitions/currencyRates';

const DUPLICATE_KEY = 11000;

export interface ICurrencyRateModel extends Model<ICurrencyRateDocument> {
  getRate(_id: string): Promise<ICurrencyRateDocument>;
  createRate(
    doc: ICurrencyRate,
    userId: string,
  ): Promise<ICurrencyRateDocument>;
  updateRate(
    _id: string,
    doc: Partial<ICurrencyRate>,
  ): Promise<ICurrencyRateDocument>;
  removeRates(_ids: string[]): Promise<string>;
}

const validateRate = (
  { date, rateCurrency, rate }: ICurrencyRate,
  mainCurrency: string,
) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    throw new ExpectedError('Date is required');
  }

  if (!rateCurrency) {
    throw new ExpectedError('Currency is required');
  }

  if (rateCurrency === mainCurrency) {
    throw new ExpectedError(
      `${rateCurrency} is the main currency, its rate is always 1`,
    );
  }

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new ExpectedError('Rate must be greater than 0');
  }
};

const duplicateError = (rateCurrency: string, date: Date) =>
  new ExpectedError(
    `A ${rateCurrency} rate for ${
      getFullDate(date).toISOString().split('T')[0]
    } already exists`,
  );

export const loadCurrencyRateClass = (models: IModels) => {
  class CurrencyRate {
    public static async getRate(_id: string) {
      const rate = await models.CurrencyRates.findOne({ _id }).lean();

      if (!rate) {
        throw new ExpectedError('Exchange rate not found');
      }

      return rate;
    }

    public static async createRate(doc: ICurrencyRate, userId: string) {
      const mainCurrency = await models.Configs.getConfigValue(
        'mainCurrency',
        '',
      );

      if (!mainCurrency) {
        throw new ExpectedError(
          'Set the main currency in General settings first',
        );
      }

      validateRate(doc, mainCurrency);

      try {
        return await models.CurrencyRates.create({
          date: getFullDate(doc.date),
          rateCurrency: doc.rateCurrency,
          rate: doc.rate,
          mainCurrency,
          source: CURRENCY_RATE_MANUAL_SOURCE,
          createdBy: userId,
        });
      } catch (e) {
        if (e.code === DUPLICATE_KEY) {
          throw duplicateError(doc.rateCurrency, doc.date);
        }

        throw e;
      }
    }

    public static async updateRate(_id: string, doc: Partial<ICurrencyRate>) {
      const current = await models.CurrencyRates.getRate(_id);

      if (current.source !== CURRENCY_RATE_MANUAL_SOURCE) {
        throw new ExpectedError(
          'Rates from a provider cannot be edited by hand',
        );
      }

      const next: ICurrencyRate = {
        date: doc.date ?? current.date,
        rateCurrency: doc.rateCurrency ?? current.rateCurrency,
        rate: doc.rate ?? current.rate,
      };

      validateRate(next, current.mainCurrency);

      try {
        return await models.CurrencyRates.findOneAndUpdate(
          { _id },
          {
            $set: {
              ...next,
              date: getFullDate(next.date),
              modifiedAt: new Date(),
            },
          },
          { new: true },
        ).lean();
      } catch (e) {
        if (e.code === DUPLICATE_KEY) {
          throw duplicateError(next.rateCurrency, next.date);
        }

        throw e;
      }
    }

    public static async removeRates(_ids: string[]) {
      await models.CurrencyRates.deleteMany({
        _id: { $in: _ids },
        source: CURRENCY_RATE_MANUAL_SOURCE,
      });

      return 'deleted';
    }
  }

  currencyRateSchema.loadClass(CurrencyRate);

  return currencyRateSchema;
};
