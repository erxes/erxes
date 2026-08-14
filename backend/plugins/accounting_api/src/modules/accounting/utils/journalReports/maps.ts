import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  escapeRegExp,
  getPureDate,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { TR_STATUSES } from '../../@types/constants';
import { IReportFilterParams } from '../../graphql/resolvers/queries/journalReport';
import { generateFilter as accountGenerateFilter } from '../../graphql/resolvers/queries/accounts';
import { IGroupCommon } from '.';
import { resolveErkhetReportJournals } from './erkhetKinds';

type ReportQuery = Record<string, unknown>;
type ReportRecord = Record<string, unknown>;
type ReportLookup = Record<string, ReportRecord | undefined>;
type AccountLookup = Record<
  string,
  | {
      code?: string;
      name?: string;
      categoryId?: {
        _id?: string;
        code?: string;
        name?: string;
      };
    }
  | undefined
>;

interface IReportFilters {
  transactionMatch: ReportQuery;
  detailMatch: ReportQuery;
}

export interface IJournalReportBase {
  code: string;
  baseGroups: string[];
  recordMode?: 'summary' | 'line';
  periodMode?: 'balance' | 'between';
  extraTransactionMatch?: ReportQuery;
  extraDetailMatch?: ReportQuery;
  sums?: Record<string, unknown>;
  supportsMore?: boolean;
}

const REPORT_GROUP_EXPRESSIONS: Record<string, unknown> = {
  accountId: '$details.accountId',
  productId: '$details.productId',
  fixedAssetId: '$details.fixedAssetId',
  customerId: '$customerId',
  journal: '$journal',
  createdBy: '$createdBy',
  contentId: '$contentId',
  contentType: '$contentType',
  branchId: { $ifNull: ['$details.branchId', '$branchId'] },
  departmentId: { $ifNull: ['$details.departmentId', '$departmentId'] },
  ptrId: { $ifNull: ['$ptrId', '$parentId'] },
};

const REPORT_GROUP_PROJECTS: Record<string, string> = {
  accountId: '$_id.accountId',
  productId: '$_id.productId',
  fixedAssetId: '$_id.fixedAssetId',
  customerId: '$_id.customerId',
  journal: '$_id.journal',
  createdBy: '$_id.createdBy',
  contentId: '$_id.contentId',
  contentType: '$_id.contentType',
  branchId: '$_id.branchId',
  departmentId: '$_id.departmentId',
  ptrId: '$_id.ptrId',
};

const uniqueStringValues = (records: ReportRecord[], field: string) => [
  ...new Set(
    records
      .map((record) => record[field])
      .filter((value): value is string => typeof value === 'string' && !!value),
  ),
];

const getStringField = (record: unknown, field: string) =>
  record && typeof record === 'object' && field in record
    ? String((record as Record<string, unknown>)[field] || '')
    : '';

const getStructureIdsWithChildren = async (
  subdomain: string,
  module: 'branches' | 'departments',
  id?: string,
) => {
  if (!id) {
    return [];
  }

  const records = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action: 'findWithChild',
    input: {
      query: { _id: id },
      fields: { _id: 1 },
    },
    defaultValue: [],
  });

  return records.map((record) => record._id);
};

const getAccountIds = async (
  models: IModels,
  params: IReportFilterParams,
  user: IUserDocument,
) => {
  const accountIds = [
    ...(params.accountIds || []),
    params.accountId || '',
  ].filter(Boolean);
  const accountFilter = await accountGenerateFilter(
    models,
    {
      ids: accountIds,
      kind: params.accountKind,
      excludeIds: params.accountExcludeIds,
      status: params.accountStatus,
      categoryId: params.accountCategoryId,
      searchValue: params.accountSearchValue,
      brand: params.accountBrand,
      isTemp: params.accountIsTemp,
      isOutBalance: params.accountIsOutBalance,
      branchId: params.accountBranchId,
      departmentId: params.accountDepartmentId,
      currency: params.accountCurrency,
      journal: params.accountJournal,
      permissionMode: 'read',
    },
    user,
  );

  const accounts = await models.Accounts.find(accountFilter, { _id: 1 }).lean();
  return accounts.map((account) => account._id);
};

const intersect = (left: string[], right: string[]) => {
  const rightSet = new Set(right);
  return left.filter((value) => rightSet.has(value));
};

const buildIdsFilter = (id?: string, ids?: string[]) => {
  const values = [...(ids || []), id || ''].filter(Boolean);

  if (!values.length) {
    return undefined;
  }

  return { $in: [...new Set(values)] };
};

const getJournalFilter = (params: IReportFilterParams) => {
  const explicitJournals = [
    ...(params.journals || []),
    params.journal || '',
  ].filter(Boolean);
  const kindFilter = resolveErkhetReportJournals({
    trKind: params.trKind,
    trKinds: params.trKinds,
    getTrKind: params.getTrKind,
  });

  if (!explicitJournals.length && !kindFilter.hasFilter) {
    return undefined;
  }

  if (!explicitJournals.length) {
    return { $in: kindFilter.journals };
  }

  if (!kindFilter.hasFilter) {
    return { $in: [...new Set(explicitJournals)] };
  }

  return {
    $in: intersect([...new Set(explicitJournals)], kindFilter.journals),
  };
};

export const getFilter = async (
  subdomain: string,
  models: IModels,
  params: IReportFilterParams,
  user: IUserDocument,
): Promise<IReportFilters> => {
  const transactionMatch: ReportQuery = {};
  const detailMatch: ReportQuery = {};
  const andFilters: ReportQuery[] = [];
  const detailAndFilters: ReportQuery[] = [];
  const orFilters: ReportQuery[] = [];

  const accountIds = await getAccountIds(models, params, user);
  detailMatch['details.accountId'] = { $in: accountIds };

  if (params.createdUserId) {
    transactionMatch.createdBy = params.createdUserId;
  }

  if (params.modifiedUserId) {
    transactionMatch.modifiedBy = params.modifiedUserId;
  }

  const journalFilter = getJournalFilter(params);
  if (journalFilter) {
    transactionMatch.journal = journalFilter;
  }

  if (params.statuses?.length) {
    transactionMatch.status = { $in: params.statuses };
  } else {
    transactionMatch.status = { $in: TR_STATUSES.ACTIVE };
  }

  if (params.status) {
    transactionMatch.status = params.status;
  }

  if (params.ptrStatus) {
    transactionMatch.ptrStatus = params.ptrStatus;
  }

  if (params.number) {
    const regex = new RegExp(`.*${escapeRegExp(params.number)}.*`, 'i');
    orFilters.push({ number: regex }, { ptrNumber: regex });
  }

  if (params.searchValue) {
    transactionMatch.description = new RegExp(
      `.*${escapeRegExp(params.searchValue)}.*`,
      'i',
    );
  }

  if (params.brandId) {
    transactionMatch.scopeBrandIds = { $in: [params.brandId] };
  }

  const customerFilter = buildIdsFilter(params.customerId, params.customerIds);
  if (customerFilter) {
    transactionMatch.customerId = customerFilter;
  }

  if (params.contentType) {
    transactionMatch.contentType = params.contentType;
  }

  if (params.contentId) {
    transactionMatch.contentId = params.contentId;
  }

  const productFilter = buildIdsFilter(params.productId, params.productIds);
  if (productFilter) {
    detailMatch['details.productId'] = productFilter;
  }

  const fixedAssetFilter = buildIdsFilter(
    params.fixedAssetId,
    params.fixedAssetIds,
  );
  if (fixedAssetFilter) {
    detailMatch['details.fixedAssetId'] = fixedAssetFilter;
  }

  const branchIds = await getStructureIdsWithChildren(
    subdomain,
    'branches',
    params.branchId,
  );
  if (branchIds.length) {
    detailAndFilters.push({
      $or: [
        { branchId: { $in: branchIds } },
        { 'details.branchId': { $in: branchIds } },
      ],
    });
  }

  const departmentIds = await getStructureIdsWithChildren(
    subdomain,
    'departments',
    params.departmentId,
  );
  if (departmentIds.length) {
    detailAndFilters.push({
      $or: [
        { departmentId: { $in: departmentIds } },
        { 'details.departmentId': { $in: departmentIds } },
      ],
    });
  }

  if (params.currency) {
    detailMatch['details.currency'] = params.currency;
  }

  if (orFilters.length) {
    andFilters.push({ $or: orFilters });
  }

  if (andFilters.length) {
    transactionMatch.$and = andFilters;
  }

  if (detailAndFilters.length) {
    detailMatch.$and = detailAndFilters;
  }

  return { transactionMatch, detailMatch };
};

const getDateMatch = (
  fromDate?: Date,
  toDate?: Date,
  period: 'opening' | 'between' = 'between',
) => {
  const dateMatch: ReportQuery = {};

  if (period === 'opening') {
    if (fromDate) {
      dateMatch.$lt = getPureDate(fromDate);
    }
    return Object.keys(dateMatch).length ? { date: dateMatch } : {};
  }

  if (fromDate) {
    dateMatch.$gte = getPureDate(fromDate);
  }

  if (toDate) {
    dateMatch.$lte = getPureDate(toDate);
  }

  return Object.keys(dateMatch).length ? { date: dateMatch } : {};
};

const isStringInFilter = (value: unknown): value is { $in: string[] } =>
  !!value &&
  typeof value === 'object' &&
  '$in' in value &&
  Array.isArray((value as { $in?: unknown }).$in);

const mergeQueryValue = (current: unknown, next: unknown) => {
  if (!current) {
    return next;
  }

  if (isStringInFilter(current) && isStringInFilter(next)) {
    return { $in: intersect(current.$in, next.$in) };
  }

  if (isStringInFilter(current) && typeof next === 'string') {
    return { $in: current.$in.includes(next) ? [next] : [] };
  }

  if (typeof current === 'string' && isStringInFilter(next)) {
    return { $in: next.$in.includes(current) ? [current] : [] };
  }

  return next;
};

const mergeMatch = (...matches: ReportQuery[]) =>
  matches.reduce<ReportQuery>((result, match) => {
    const merged = { ...result };

    Object.entries(match).forEach(([key, value]) => {
      merged[key] = mergeQueryValue(merged[key], value);
    });

    return merged;
  }, {});

const getGroupNames = (baseGroups: string[], groupRules: IGroupCommon[]) => {
  const names = new Set(baseGroups);

  for (const rule of groupRules) {
    if (REPORT_GROUP_EXPRESSIONS[rule.group]) {
      names.add(rule.group);
    }
  }

  return [...names];
};

const buildGroupStage = (
  groupNames: string[],
  sums: Record<string, unknown>,
  includeBetweenFlag: boolean,
) => {
  const groupId: ReportQuery = { side: '$side' };

  for (const groupName of groupNames) {
    groupId[groupName] = REPORT_GROUP_EXPRESSIONS[groupName];
  }

  return {
    _id: groupId,
    ...sums,
    ...(includeBetweenFlag ? { isBetween: { $sum: 1 } } : {}),
  };
};

const buildProjectStage = (
  groupNames: string[],
  sums: Record<string, unknown>,
) => {
  const project: ReportQuery = {
    _id: 0,
    side: '$_id.side',
    isBetween: 1,
  };

  for (const sumName of Object.keys(sums)) {
    project[sumName] = 1;
  }

  for (const groupName of groupNames) {
    project[groupName] = REPORT_GROUP_PROJECTS[groupName];
  }

  return project;
};

const fetchBranches = async (
  subdomain: string,
  branchIds: string[],
): Promise<ReportLookup> => {
  if (!branchIds.length) {
    return {};
  }

  const branches = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'branches',
    action: 'find',
    input: {
      query: { _id: { $in: branchIds } },
      fields: { _id: 1, title: 1, code: 1 },
    },
    defaultValue: [],
  });

  return Object.fromEntries(branches.map((branch) => [branch._id, branch]));
};

const fetchDepartments = async (
  subdomain: string,
  departmentIds: string[],
): Promise<ReportLookup> => {
  if (!departmentIds.length) {
    return {};
  }

  const departments = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'departments',
    action: 'find',
    input: {
      query: { _id: { $in: departmentIds } },
      fields: { _id: 1, title: 1, code: 1 },
    },
    defaultValue: [],
  });

  return Object.fromEntries(
    departments.map((department) => [department._id, department]),
  );
};

const fetchProducts = async (
  subdomain: string,
  productIds: string[],
): Promise<ReportLookup> => {
  if (!productIds.length) {
    return {};
  }

  const products = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'products',
    action: 'find',
    input: {
      query: { _id: { $in: productIds } },
      fields: { _id: 1, code: 1, name: 1, categoryId: 1, unitPrice: 1 },
      limit: productIds.length,
    },
    defaultValue: [],
  });

  return Object.fromEntries(products.map((product) => [product._id, product]));
};

const fetchUsers = async (
  subdomain: string,
  userIds: string[],
): Promise<ReportLookup> => {
  if (!userIds.length) {
    return {};
  }

  const users = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query: { _id: { $in: userIds } },
      fields: { _id: 1, username: 1, email: 1, details: 1 },
      limit: userIds.length,
    },
    defaultValue: [],
  });

  return Object.fromEntries(users.map((user) => [user._id, user]));
};

const fetchCustomers = async (
  subdomain: string,
  customerIds: string[],
): Promise<ReportLookup> => {
  if (!customerIds.length) {
    return {};
  }

  const customers = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findActiveCustomers',
    input: {
      query: { _id: { $in: customerIds } },
      fields: { _id: 1, code: 1, firstName: 1, lastName: 1, primaryName: 1 },
      limit: customerIds.length,
    },
    defaultValue: [],
  });

  return Object.fromEntries(
    customers.map((customer) => [customer._id, customer]),
  );
};

const enrichRecords = async (
  subdomain: string,
  models: IModels,
  records: ReportRecord[],
) => {
  const accountIds = uniqueStringValues(records, 'accountId');
  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, kind: 1, categoryId: 1 },
  ).populate({
    path: 'categoryId',
    model: 'account_categories',
    select: 'code name',
  });

  const accountById: AccountLookup = Object.fromEntries(
    accounts.map((account) => {
      const category = account.categoryId as unknown as
        | {
            _id?: string;
            code?: string;
            name?: string;
          }
        | string
        | undefined;

      return [
        account._id,
        {
          code: account.code,
          name: account.name,
          categoryId:
            typeof category === 'object'
              ? {
                  _id: category._id,
                  code: category.code,
                  name: category.name,
                }
              : undefined,
        },
      ];
    }),
  );
  const branchById = await fetchBranches(
    subdomain,
    uniqueStringValues(records, 'branchId'),
  );
  const departmentById = await fetchDepartments(
    subdomain,
    uniqueStringValues(records, 'departmentId'),
  );
  const productById = await fetchProducts(
    subdomain,
    uniqueStringValues(records, 'productId'),
  );
  const customerById = await fetchCustomers(
    subdomain,
    uniqueStringValues(records, 'customerId'),
  );
  const fixedAssets = await models.FixedAssets.find(
    { _id: { $in: uniqueStringValues(records, 'fixedAssetId') } },
    { _id: 1, code: 1, name: 1, categoryId: 1 },
  ).lean();
  const fixedAssetById: ReportLookup = Object.fromEntries(
    fixedAssets.map((fixedAsset) => [fixedAsset._id, fixedAsset]),
  );
  const userById = await fetchUsers(
    subdomain,
    uniqueStringValues(records, 'createdBy'),
  );

  return records.map((record) => {
    const account =
      typeof record.accountId === 'string'
        ? accountById[record.accountId]
        : undefined;
    const accountCategory = account?.categoryId;
    const branch =
      typeof record.branchId === 'string'
        ? branchById[record.branchId]
        : undefined;
    const department =
      typeof record.departmentId === 'string'
        ? departmentById[record.departmentId]
        : undefined;
    const product =
      typeof record.productId === 'string'
        ? productById[record.productId]
        : undefined;
    const customer =
      typeof record.customerId === 'string'
        ? customerById[record.customerId]
        : undefined;
    const fixedAsset =
      typeof record.fixedAssetId === 'string'
        ? fixedAssetById[record.fixedAssetId]
        : undefined;
    const createdUser =
      typeof record.createdBy === 'string'
        ? userById[record.createdBy]
        : undefined;
    const customerName = [customer?.firstName, customer?.lastName]
      .filter(Boolean)
      .join(' ');
    const userName =
      createdUser?.username ||
      createdUser?.email ||
      getStringField(createdUser?.details, 'fullName') ||
      '';

    return {
      ...record,
      accountCode: account?.code,
      accountName: account?.name,
      accountCategoryId: accountCategory?._id,
      accountCategoryCode: accountCategory?.code,
      accountCategoryName: accountCategory?.name,
      branchCode: branch?.code,
      branchName: branch?.title,
      departmentCode: department?.code,
      departmentName: department?.title,
      productCode: product?.code,
      productName: product?.name,
      productCategoryId: product?.categoryId,
      productUnitPrice: product?.unitPrice,
      customerCode: customer?.code,
      customerName: customer?.primaryName || customerName,
      fixedAssetCode: fixedAsset?.code,
      fixedAssetName: fixedAsset?.name,
      fixedAssetCategoryId: fixedAsset?.categoryId,
      createdByCode: createdUser?.email || createdUser?.username,
      createdByName: userName,
      contentCode: record.contentId,
      contentName: record.contentType,
    };
  });
};

export const recordListWithValues = async (
  subdomain: string,
  models: IModels,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
  reportBase: IJournalReportBase,
) => {
  const { fromDate, toDate, ...filters } = filterParams;
  const reportFilters = await getFilter(subdomain, models, filters, user);
  const groupNames = getGroupNames(reportBase.baseGroups, groupRules);
  const sums = reportBase.sums || {
    sumAmount: { $sum: '$details.amount' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' },
  };
  const projectStage = buildProjectStage(groupNames, sums);

  const commonPipeline = [
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
    {
      $match: mergeMatch(
        reportFilters.detailMatch,
        reportBase.extraDetailMatch || {},
      ),
    },
  ];
  const baseMatch = mergeMatch(
    reportFilters.transactionMatch,
    reportBase.extraTransactionMatch || {},
  );

  const openingRecords =
    fromDate && reportBase.periodMode !== 'between'
      ? await models.Transactions.aggregate([
          {
            $match: mergeMatch(
              baseMatch,
              getDateMatch(fromDate, toDate, 'opening'),
            ),
          },
          ...commonPipeline,
          { $group: buildGroupStage(groupNames, sums, false) },
          { $project: projectStage },
        ])
      : [];

  const betweenRecords = await models.Transactions.aggregate([
    { $match: mergeMatch(baseMatch, getDateMatch(fromDate, toDate)) },
    ...commonPipeline,
    { $group: buildGroupStage(groupNames, sums, true) },
    { $project: projectStage },
  ]);

  return enrichRecords(subdomain, models, [
    ...openingRecords,
    ...betweenRecords,
  ]);
};

export const getLineRecords = async (
  subdomain: string,
  models: IModels,
  filterParams: IReportFilterParams,
  user: IUserDocument,
  reportBase: IJournalReportBase,
) => {
  const { fromDate, toDate, ...filters } = filterParams;
  const reportFilters = await getFilter(subdomain, models, filters, user);
  const baseMatch = mergeMatch(
    reportFilters.transactionMatch,
    reportBase.extraTransactionMatch || {},
    getDateMatch(fromDate, toDate),
  );

  const records = await models.Transactions.aggregate([
    { $match: baseMatch },
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
    {
      $match: mergeMatch(
        reportFilters.detailMatch,
        reportBase.extraDetailMatch || {},
      ),
    },
    {
      $project: {
        _id: 0,
        transactionId: '$_id',
        parentId: 1,
        ptrId: { $ifNull: ['$ptrId', '$parentId'] },
        date: 1,
        number: 1,
        ptrNumber: 1,
        description: 1,
        side: 1,
        detailInd: 1,
        accountId: '$details.accountId',
        branchId: { $ifNull: ['$details.branchId', '$branchId'] },
        departmentId: { $ifNull: ['$details.departmentId', '$departmentId'] },
        productId: '$details.productId',
        fixedAssetId: '$details.fixedAssetId',
        customerId: '$customerId',
        createdBy: '$createdBy',
        contentId: '$contentId',
        contentType: '$contentType',
        currency: '$details.currency',
        currencyAmount: '$details.currencyAmount',
        amount: '$details.amount',
        debit: {
          $cond: [{ $eq: ['$side', 'dt'] }, '$details.amount', 0],
        },
        credit: {
          $cond: [{ $eq: ['$side', 'ct'] }, '$details.amount', 0],
        },
      },
    },
    { $sort: { date: 1, number: 1, ptrId: 1, detailInd: 1 } },
  ]);

  return enrichRecords(subdomain, models, records);
};
