import { checkPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

interface IQueryParams {
  searchValue?: string;
}

const generateFilter = async (
  commonQuerySelector: any,
  params: IQueryParams
) => {
  const { searchValue } = params;
  const filter: any = commonQuerySelector;

  // search =========
  if (searchValue) {
    filter.$or = [
      { mainCurrency: { $regex: new RegExp(searchValue) } },
      { rateCurrency: { $regex: new RegExp(searchValue) } },
    ];
  }

  return filter;
};

const exchangeRateQueries = {
  /**
   * loan Research for only main list
   */

  exchangeRatesMain: async (
    _root,
    params,
    { models, commonQuerySelector }: IContext
  ) => {
    const filter = await generateFilter(commonQuerySelector, params);

    return {
      list: await paginate(
        models.ExchangeRates.find(filter).sort({ createdAt: -1 }),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: await models.ExchangeRates.find(filter).countDocuments(),
    };
  },
};

checkPermission(exchangeRateQueries, 'exchangeRatesMain', 'showExchangeRates');

export default exchangeRateQueries;
