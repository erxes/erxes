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

interface IReportBuildOptions {
  baseGroups: string[];
  extraTransactionMatch?: ReportQuery;
  extraDetailMatch?: ReportQuery;
  sums?: Record<string, unknown>;
}

const REPORT_GROUP_EXPRESSIONS: Record<string, string> = {
  accountId: '$details.accountId',
  productId: '$details.productId',
  branchId: '$branchId',
  departmentId: '$departmentId',
};

const REPORT_GROUP_PROJECTS: Record<string, string> = {
  accountId: '$_id.accountId',
  productId: '$_id.productId',
  branchId: '$_id.branchId',
  departmentId: '$_id.departmentId',
};

const uniqueStringValues = (records: ReportRecord[], field: string) => [
  ...new Set(
    records
      .map((record) => record[field])
      .filter((value): value is string => typeof value === 'string' && !!value),
  ),
];

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
  const accountFilter = await accountGenerateFilter(
    models,
    {
      ids: params.accountIds,
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

export const generateReportFilters = async (
  subdomain: string,
  models: IModels,
  params: IReportFilterParams,
  user: IUserDocument,
): Promise<IReportFilters> => {
  const transactionMatch: ReportQuery = {};
  const detailMatch: ReportQuery = {};
  const andFilters: ReportQuery[] = [];
  const orFilters: ReportQuery[] = [];

  const accountIds = await getAccountIds(models, params, user);
  detailMatch['details.accountId'] = { $in: accountIds };

  if (params.createdUserId) {
    transactionMatch.createdBy = params.createdUserId;
  }

  if (params.modifiedUserId) {
    transactionMatch.modifiedBy = params.modifiedUserId;
  }

  if (params.journals?.length) {
    transactionMatch.journal = { $in: params.journals };
  }

  if (params.journal) {
    transactionMatch.journal = params.journal;
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

  const branchIds = await getStructureIdsWithChildren(
    subdomain,
    'branches',
    params.branchId,
  );
  if (branchIds.length) {
    transactionMatch.branchId = { $in: branchIds };
  }

  const departmentIds = await getStructureIdsWithChildren(
    subdomain,
    'departments',
    params.departmentId,
  );
  if (departmentIds.length) {
    transactionMatch.departmentId = { $in: departmentIds };
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
      dateMatch.$lte = getPureDate(fromDate);
    }
    return Object.keys(dateMatch).length ? { date: dateMatch } : {};
  }

  if (fromDate) {
    dateMatch.$gt = getPureDate(fromDate);
  }

  if (toDate) {
    dateMatch.$lte = getPureDate(toDate);
  }

  return Object.keys(dateMatch).length ? { date: dateMatch } : {};
};

const mergeMatch = (...matches: ReportQuery[]) =>
  matches.reduce<ReportQuery>((result, match) => ({ ...result, ...match }), {});

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

const buildProjectStage = (groupNames: string[]) => {
  const project: ReportQuery = {
    _id: 0,
    side: '$_id.side',
    sumAmount: 1,
    sumCurrencyAmount: 1,
    isBetween: 1,
  };

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
      fields: { _id: 1, code: 1, name: 1, categoryId: 1 },
      limit: productIds.length,
    },
    defaultValue: [],
  });

  return Object.fromEntries(products.map((product) => [product._id, product]));
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
    };
  });
};

export const buildJournalReportRecords = async (
  subdomain: string,
  models: IModels,
  groupRules: IGroupCommon[],
  filterParams: IReportFilterParams,
  user: IUserDocument,
  options: IReportBuildOptions,
) => {
  const { fromDate, toDate, ...filters } = filterParams;
  const reportFilters = await generateReportFilters(
    subdomain,
    models,
    filters,
    user,
  );
  const groupNames = getGroupNames(options.baseGroups, groupRules);
  const sums = options.sums || {
    sumAmount: { $sum: '$details.amount' },
    sumCurrencyAmount: { $sum: '$details.currencyAmount' },
  };
  const projectStage = buildProjectStage(groupNames);

  const commonPipeline = [
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
    {
      $match: mergeMatch(
        reportFilters.detailMatch,
        options.extraDetailMatch || {},
      ),
    },
  ];
  const baseMatch = mergeMatch(
    reportFilters.transactionMatch,
    options.extraTransactionMatch || {},
  );

  const openingRecords = fromDate
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
