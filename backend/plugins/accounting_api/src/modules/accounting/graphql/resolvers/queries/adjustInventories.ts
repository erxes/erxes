import { ACCOUNT_STATUSES } from '@/accounting/@types/constants';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { defaultPaginate, escapeRegExp } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

interface IQueryParams {
  startDate: Date
  endDate: Date
  description: string
  status: string
  error: string
  warning: string
  startBeginDate: Date
  endBeginDate: Date
  startSuccessDate: Date
  endSuccessDate: Date
  startCheckedAt: Date
  endCheckedAt: Date
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

interface IDetailsQueryParams {
  _id: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export const generateFilter = async (
  models: IModels,
  params: IQueryParams,
  user: IUserDocument
) => {
  const {
    startDate,
    endDate,
    description,
    status,
    error,
    warning,
    startBeginDate,
    endBeginDate,
    startSuccessDate,
    endSuccessDate,
    startCheckedAt,
    endCheckedAt,
    page,
    perPage,
    sortField,
    sortDirection,
  } = params;
  const filter: any = {};

  filter.status = { $ne: ACCOUNT_STATUSES.DELETED };

  return filter;
};

const adjustInventoryQueries = {
  /**
   * Accounts list
   */
  async adjustInventories(
    _root,
    params: IQueryParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      params,
      user,
    );

    const { sortField, sortDirection, page, perPage } = params;

    const pagintationArgs = { page, perPage };

    let sort: any = { code: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.AdjustInventories.find(filter).sort(sort).lean(),
      pagintationArgs,
    )
  },

  async adjustInventoriesCount(
    _root,
    params: IQueryParams,
    { models, user }: IContext,
  ) {
    const filter = await generateFilter(
      models,
      params,
      user,
    );

    return models.AdjustInventories.find(filter).countDocuments();
  },

  async adjustInventoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return await models.AdjustInventories.findOne({ _id }).lean();
  },

  async adjustInventoryDetails(_root, params: IDetailsQueryParams, { models }: IContext) {
    const { _id, sortField, sortDirection, page, perPage } = params;

    const pagintationArgs = { page, perPage };

    let sort: any = { createdAt: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.AdjustInvDetails.find({ adjustId: _id }).sort(sort),
      pagintationArgs,
    )
  },

  async adjustInventoryDetailsCount(_root, { _id }: { _id: string }, { models }: IContext) {
    return await models.AdjustInvDetails.find({ adjustId: _id }).countDocuments();
  }

};

// requireLogin(adjustInventoryQueries, 'accountsCount');
// checkPermission(adjustInventoryQueries, 'accounts', 'showAccounts', []);

export default adjustInventoryQueries;
