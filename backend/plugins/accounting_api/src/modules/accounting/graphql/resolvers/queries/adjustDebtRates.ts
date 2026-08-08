import { IContext } from '~/connectionResolvers';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IAdjustDebtRateDocument } from '@/accounting/@types/adjustDebtRate';

interface IQueryParams {
  ids?: string[];
  date?: Date;
  mainCurrency?: string;
  currency?: string;
  customerId?: string;
  searchValue?: string;
  branchId?: string;
  departmentId?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export const generateFilter = async (params: IQueryParams) => {
  const {
    ids,
    date,
    mainCurrency,
    currency,
    customerId,
    searchValue,
    branchId,
    departmentId,
  } = params;

  const filter: FilterQuery<IAdjustDebtRateDocument> = {};

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

  if (customerId) {
    filter.customerId = customerId;
  }

  if (branchId) {
    filter.branchId = branchId;
  }

  if (departmentId) {
    filter.departmentId = departmentId;
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

const adjustDebtRateQueries = {
  /**
   * Adjust debt rates list
   */
  async adjustDebtRates(
    _root: unknown,
    params: IQueryParams & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const filter = await generateFilter(params);

    const { sortField = 'createdAt', sortDirection = -1 } = params;

    params.orderBy ??= { [sortField]: sortDirection as 1 | -1 };

    return cursorPaginate({
      model: models.AdjustDebtRates,
      params,
      query: filter,
    });
  },

  /**
   * Get one adjust debt rate
   */
  async adjustDebtRateDetail(
    _root: unknown,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AdjustDebtRates.getAdjustDebtRate(_id);
  },
};

export default adjustDebtRateQueries;
