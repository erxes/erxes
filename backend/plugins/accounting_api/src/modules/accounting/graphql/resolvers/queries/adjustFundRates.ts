import { IContext } from '~/connectionResolvers';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp, fixNum } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IAdjustFundRateDocument } from '@/accounting/@types/adjustRateFundDetails';

interface IQueryParams {
  ids?: string[];
  date?: Date;
  mainCurrency?: string;
  currency?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export const generateFilter = async (params: IQueryParams) => {
  const { ids, date, mainCurrency, currency, searchValue } = params;

  const filter: FilterQuery<IAdjustFundRateDocument> = {};

  if (ids && ids.length > 0) {
    filter._id = { $in: ids };
  }

  if (date) {
    filter.date = date;
  }

  if (mainCurrency) {
    filter.mainCurrency = mainCurrency;
  }

  if (currency) {
    filter.currency = currency;
  }

  if (searchValue) {
    filter.$or = [
      {
        description: {
          $regex: `.*${escapeRegExp(searchValue)}.*`,
          $options: 'i',
        },
      },
      {
        mainCurrency: {
          $regex: `.*${escapeRegExp(searchValue)}.*`,
          $options: 'i',
        },
      },
      {
        currency: { $regex: `.*${escapeRegExp(searchValue)}.*`, $options: 'i' },
      },
    ];
  }

  return filter;
};

const adjustFundRateQueries = {
  /**
   * Adjust fund rates list
   */
  async adjustFundRates(
    _root: unknown,
    params: IQueryParams & ICursorPaginateParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustFundRates');

    const filter = await generateFilter(params);

    const { sortField = 'createdAt', sortDirection = -1 } = params;

    params.orderBy ??= { [sortField]: sortDirection as 1 | -1 };

    return cursorPaginate({
      model: models.AdjustFundRates,
      params,
      query: filter,
    });
  },

  /**
   * Get one adjust fund rate
   */
  async adjustFundRateDetail(
    _root: unknown,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('readAdjustFundRates');

    const adjustFundRate = await models.AdjustFundRates.getAdjustFundRate(_id);
    const accountIds = [
      ...new Set(
        (adjustFundRate.details || []).map((detail) => detail.accountId),
      ),
    ];
    const accounts = await models.Accounts.find(
      { _id: { $in: accountIds } },
      { _id: 1, code: 1, name: 1, currency: 1 },
    ).lean();
    const accountById = new Map(
      accounts.map((account) => [account._id, account]),
    );

    return {
      ...adjustFundRate,
      details: (adjustFundRate.details || []).map((detail) => {
        const account = accountById.get(detail.accountId);
        const diff = fixNum(
          (detail.currencyBalance || 0) * (adjustFundRate.spotRate || 0) -
            (detail.mainBalance || 0),
          2,
        );

        return {
          ...detail,
          accountCode: account?.code,
          accountName: account?.name,
          accountCurrency: account?.currency,
          diff,
        };
      }),
    };
  },
};

export default adjustFundRateQueries;
