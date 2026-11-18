import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, getFullDate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICurrencyRateDocument } from '@/currencyRates/db/definitions/currencyRates';

export interface ICurrencyRatesParams extends ICursorPaginateParams {
  rateCurrency?: string;
  startDate?: Date;
  endDate?: Date;
}

export const currencyRateQueries = {
  async currencyRates(
    _root: undefined,
    { rateCurrency, startDate, endDate, ...params }: ICurrencyRatesParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('exchangeRatesRead');

    const filter: FilterQuery<ICurrencyRateDocument> = {};

    if (rateCurrency) {
      filter.rateCurrency = rateCurrency;
    }

    if (startDate || endDate) {
      filter.date = {
        ...(startDate ? { $gte: getFullDate(startDate) } : {}),
        ...(endDate ? { $lte: getFullDate(endDate) } : {}),
      };
    }

    return cursorPaginate({
      model: models.CurrencyRates,
      params: { orderBy: { date: -1, rateCurrency: 1 }, ...params },
      query: filter,
    });
  },
};
