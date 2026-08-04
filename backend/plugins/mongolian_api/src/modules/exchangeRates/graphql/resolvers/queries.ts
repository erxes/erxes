import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';

interface IQueryParams {
  searchValue?: string;
}

const generateFilter = async (
  commonQuerySelector: any,
  params: IQueryParams,
) => {
  const { searchValue } = params;
  // Spreading a possibly-undefined value yields {}, so no fallback needed.
  const filter: any = { ...commonQuerySelector };

  // search =========
  if (searchValue) {
    filter.$or = [
      { mainCurrency: { $regex: new RegExp(searchValue, 'i') } },
      { rateCurrency: { $regex: new RegExp(searchValue, 'i') } },
    ];
  }

  return filter;
};

export const exchangeRateQueries = {
  /**
   * Retrieve exchange rates with pagination and search
   */
  exchangeRatesMain: async (
    _root,
    params,
    { models, commonQuerySelector }: IContext,
  ) => {
    const filter = await generateFilter(commonQuerySelector, params);

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.ExchangeRates,
      params: {
        ...params,
        orderBy: { createdAt: -1 },
      },
      query: filter,
    });

    return { list, totalCount, pageInfo };
  },

  async exchangeGetRate(
    _root,
    args: { currency: string; date: Date; mainCurrency?: string },
    { models }: IContext,
  ) {
    const { date, currency, mainCurrency } = args;
    return await models.ExchangeRates.getActiveRate({
      date,
      rateCurrency: currency,
      mainCurrency,
    });
  },
};