import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { IPeriodLockDocument } from '../../../models/definitions/periodLocks';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;
  if (params.startDate) {
    filter.payDate = {
      $gte: new Date(params.startDate)
    };
  }

  if (params.endDate) {
    filter.payDate = {
      $lte: new Date(params.endDate)
    };
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const periodLockQueries = {
  /**
   * PeriodLocks list
   */

  periodLocks: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.PeriodLocks.find(
        await generateFilter(params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * PeriodLocks for only main list
   */

  periodLocksMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: paginate(
        models.PeriodLocks.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: models.PeriodLocks.find(filter).count()
    };
  },

  /**
   * Get one periodLock
   */

  periodLockDetail: async (
    _root,
    { _id }: IPeriodLockDocument,
    { models }: IContext
  ) => {
    return models.PeriodLocks.getPeriodLock({ _id });
  }
};

checkPermission(periodLockQueries, 'periodLocks', 'showPeriodLocks');
checkPermission(periodLockQueries, 'periodLocksMain', 'showPeriodLocks');
checkPermission(periodLockQueries, 'periodLockDetail', 'showPeriodLocks');

export default periodLockQueries;
