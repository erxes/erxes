import {
  ICursorPaginateParams,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  cursorPaginateAggregation,
  defaultPaginate,
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels, IContext } from '~/connectionResolvers';
import { TR_STATUSES } from '@/accounting/@types/constants';
import { ITransactionDocument } from '@/accounting/@types/transaction';
import { generateFilter as accountGenerateFilter } from './accounts';
import { checkPermissionTrs } from '../../../utils/trPermissions';

interface IQueryParams {
  ids?: string[];
  excludeIds?: boolean;
  status?: string;
  searchValue?: string;
  number?: string;
  ptrStatus: string;

  accountIds?: string[];
  accountKind?: string;
  accountExcludeIds?: boolean;
  accountStatus?: string;
  accountCategoryId?: string;
  accountSearchValue?: string;
  accountBrand?: string;
  accountIsTemp?: boolean;
  accountIsOutBalance?: boolean;
  accountBranchId: string;
  accountDepartmentId: string;
  accountCurrency: string;
  accountJournal: string;

  brandId?: string;
  isOutBalance?: boolean;
  branchId: string;
  departmentId: string;
  currency: string;
  journal: string;
  journals: string[];
  statuses: string[];

  createdUserId?: string;
  modifiedUserId?: string;
  startDate?: Date;
  endDate?: Date;
  startUpdatedDate?: Date;
  endUpdatedDate?: Date;
  startCreatedDate?: Date;
  endCreatedDate?: Date;

  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

interface IRecordsParams extends IQueryParams {
  groupRule: string[];
  folded: boolean;
}

const getAccountIds = async (
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
): Promise<string[]> => {
  const {
    accountIds,
    accountKind,
    accountExcludeIds,
    accountStatus,
    accountCategoryId,
    accountSearchValue,
    accountBrand,
    accountIsTemp,
    accountIsOutBalance,
    accountBranchId,
    accountDepartmentId,
    accountCurrency,
    accountJournal,
  } = params;

  const accountFilter: any = await accountGenerateFilter(
    models,
    {
      ids: accountIds,
      kind: accountKind,
      excludeIds: accountExcludeIds,
      status: accountStatus,
      categoryId: accountCategoryId,
      searchValue: accountSearchValue,
      brand: accountBrand,
      isTemp: accountIsTemp,
      isOutBalance: accountIsOutBalance,
      branchId: accountBranchId,
      departmentId: accountDepartmentId,
      currency: accountCurrency,
      journal: accountJournal,
    },
    user,
  );

  const accounts = await models.Accounts.find(
    { ...accountFilter },
    { _id: 1 },
  ).lean();
  return accounts.map((a) => a._id);
};

const generateFilter = async (
  subdomain: string,
  models: IModels,
  params: IQueryParams,
  user: IUserDocument,
) => {
  const {
    ids,
    excludeIds,
    searchValue,
    number,
    journal,
    journals,
    brandId,
    branchId,
    departmentId,
    currency,
    statuses,
    ptrStatus,
    status,
    createdUserId,
    modifiedUserId,
    startDate,
    endDate,
    startUpdatedDate,
    endUpdatedDate,
    startCreatedDate,
    endCreatedDate,
  } = params;
  const filter: any = {};

  if (createdUserId) {
    filter.createdBy = createdUserId;
  }

  if (modifiedUserId) {
    filter.modifiedBy = modifiedUserId;
  }

  const dateQry: any = {};
  if (startDate) {
    dateQry.$gte = getPureDate(startDate);
  }
  if (endDate) {
    dateQry.$lte = getPureDate(endDate);
  }
  if (Object.keys(dateQry).length) {
    filter.date = dateQry;
  }

  const createdDateQry: any = {};
  if (startCreatedDate) {
    createdDateQry.$gte = getPureDate(startCreatedDate);
  }
  if (endCreatedDate) {
    createdDateQry.$lte = getPureDate(endCreatedDate);
  }
  if (Object.keys(createdDateQry).length) {
    filter.createdAt = createdDateQry;
  }

  const updatedDateQry: any = {};
  if (startUpdatedDate) {
    updatedDateQry.$gte = getPureDate(startUpdatedDate);
  }
  if (endUpdatedDate) {
    updatedDateQry.$lte = getPureDate(endUpdatedDate);
  }
  if (Object.keys(updatedDateQry).length) {
    filter.updatedAt = updatedDateQry;
  }

  filter['details.accountId'] = {
    $in: await getAccountIds(models, params, user),
  };

  if (journals?.length) {
    filter.journal = { $in: journals };
  }

  if (journal) {
    filter.journal = journal;
  }

  if (statuses?.length) {
    filter.status = { $in: statuses };
  } else {
    filter.status = { $in: TR_STATUSES.ACTIVE };
  }

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (number) {
    const regex = new RegExp(`.*${escapeRegExp(number)}.*`, 'i');
    filter.number = { $in: [regex] };
  }

  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    filter.description = regex;
  }

  if (ptrStatus) {
    filter.ptrStatus = ptrStatus;
  }

  if (status) {
    filter.status = status;
  }

  if (brandId) {
    filter.scopeBrandIds = { $in: [brandId] };
  }

  if (branchId) {
    const branches = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'branches',
      action: 'findWithChild',
      input: {
        query: { _id: branchId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.branchId = { $in: branches.map((item) => item._id) };
  }

  if (departmentId) {
    const departments = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'departments',
      action: 'findWithChild',
      input: {
        query: { _id: departmentId },
        fields: { _id: 1 },
      },
      defaultValue: [],
    });

    filter.departmentId = { $in: departments.map((item) => item._id) };
  }

  if (currency) {
    filter['details.currency'] = currency;
  }

  return filter;
};

const transactionCommon = {
  async accTransactionsDetail(
    _root,
    params: { _id: string },
    { models, user }: IContext,
  ) {
    const { _id } = params;
    let firstTr = await models.Transactions.getTransaction({
      $or: [{ _id }, { parentId: _id }],
    });

    if (firstTr.originId) {
      firstTr = await models.Transactions.getTransaction({
        _id: firstTr.originId,
      });
    }

    const relatedTrs: ITransactionDocument[] = await models.Transactions.find({
      $or: [{ ptrId: firstTr.ptrId }, { parentId: firstTr.parentId }],
    }).lean();

    return await checkPermissionTrs(models, relatedTrs, user);
  },

  async accTransactionDetail(
    _root,
    params: { _id: string },
    { models }: IContext,
  ) {
    const transaction = await models.Transactions.findOne({
      _id: params._id,
    }).lean();

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return [transaction];
  },

  async accTransactionsMain(
    _root,
    params: IQueryParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);

    // Set default orderBy
    params.orderBy ??= { date: 1 };
    params.orderBy = {
      ...params.orderBy,
      ptrId: params.orderBy?.ptrId ?? 1,
    };

    return await cursorPaginate({
      model: models.Transactions,
      params,
      query: filter,
    });
  },

  async accTransactions(
    _root,
    params: IQueryParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);

    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pagintationArgs = { page, perPage };
    if (
      ids?.length &&
      !excludeIds &&
      ids.length > (pagintationArgs.perPage || 20)
    ) {
      pagintationArgs.page = 1;
      pagintationArgs.perPage = ids.length;
    }

    let sort: any = { date: 1 };
    if (sortField) {
      sort = { [sortField]: sortDirection ?? 1 };
    }

    return await defaultPaginate(
      models.Transactions.find(filter)
        .sort({ ...sort, parentId: 1, ptrId: 1 })
        .lean(),
      pagintationArgs,
    );
  },

  async accTransactionsCount(
    _root,
    params: IQueryParams,
    { models, user, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);

    return models.Transactions.find(filter).countDocuments();
  },

  async accTrRecordsMain(
    _root,
    params: IRecordsParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);
    const { ids, excludeIds } = params;

    if (ids?.length && !excludeIds && ids.length > (params.limit ?? 20)) {
      params.cursor = '';
      params.limit = ids.length;
    }

    params.orderBy ??= { date: 1 };
    params.orderBy = {
      ...params.orderBy,
      ptrId: params.orderBy?.ptrId ?? 1,
      _id: params.orderBy?._id ?? 1,
    };

    return await cursorPaginateAggregation({
      model: models.Transactions,
      pipeline: [
        { $match: { ...filter } },
        { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$$ROOT',
                { _id: { $concat: ['$_id', '-', '$details._id'] } },
                { trId: '$_id' },
              ],
            },
          },
        },
      ],
      params,
      formatter: { date: 'date', createAt: 'date' },
    });
  },

  async accTrRecords(
    _root,
    params: IRecordsParams & { page: number; perPage: number },
    { models, user, subdomain }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);
    const { sortField, sortDirection, page, perPage, ids, excludeIds } = params;

    const pageArgs = { page, perPage };
    if (ids?.length && !excludeIds && ids.length > (pageArgs.perPage || 20)) {
      pageArgs.page = 1;
      pageArgs.perPage = ids.length;
    }
    const $limit = Number(pageArgs.perPage || '20');
    const $skip = (Number(pageArgs.page || '1') - 1) * $limit;

    let $sort: any = { date: 1 };
    if (sortField) {
      $sort = { [sortField]: sortDirection ?? 1 };
    }

    return await models.Transactions.aggregate([
      { $match: { ...filter } },
      { $sort },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      { $skip },
      { $limit },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$$ROOT',
              { _id: { $concat: ['$_id', '-', '$details._id'] } },
              { trId: '$_id' },
            ],
          },
        },
      },
      // accountaar groupleh ingesneer shortDetailiig bii bolgoh
      // { $group: { _id: '$details.accountId', } }
    ]);
  },

  async accTrRecordsCount(
    _root,
    params: IRecordsParams,
    { models, subdomain, user }: IContext,
  ) {
    const filter = await generateFilter(subdomain, models, params, user);

    const count = await models.Transactions.aggregate([
      { $match: { ...filter } },
      { $unwind: '$details' },
      { $group: { _id: null, count: { $sum: 1 } } },
      { $project: { _id: 0 } },
    ]);
    return count[0].count;
  },
};

export default transactionCommon;
