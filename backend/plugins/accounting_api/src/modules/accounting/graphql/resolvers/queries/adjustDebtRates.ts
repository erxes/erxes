import { IContext, IModels } from '~/connectionResolvers';
import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';

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

export const generateFilter = async (
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
) => {
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

  const filter: any = {};

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
    _root,
    params: IQueryParams & ICursorPaginateParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(models, params, user);

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
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AdjustDebtRates.getAdjustDebtRate(_id);
  },
};

export default adjustDebtRateQueries;
