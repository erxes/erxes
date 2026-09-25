import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { escapeRegExp, getPureDate } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ITransactionDocument,
  ITrDetail,
} from '~/modules/accounting/@types/transaction';

type ExportFilters = Record<string, unknown>;
type ExportQuery = Record<string, unknown>;
type AccountLookup = Map<
  string,
  { code?: string; name?: string; currency?: string }
>;

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' && value ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const asStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string' && value) {
    return value.split(',').filter(Boolean);
  }

  return undefined;
};

const asDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const addDateRange = (
  query: ExportQuery,
  field: string,
  start?: unknown,
  end?: unknown,
) => {
  const dateQuery: Record<string, Date> = {};
  const startDate = asDate(start);
  const endDate = asDate(end);

  if (startDate) {
    dateQuery.$gte = getPureDate(startDate);
  }
  if (endDate) {
    dateQuery.$lte = getPureDate(endDate);
  }
  if (Object.keys(dateQuery).length) {
    query[field] = dateQuery;
  }
};

const addRegexFilter = (query: ExportQuery, field: string, value?: string) => {
  if (value) {
    query[field] = new RegExp(`.*${escapeRegExp(value)}.*`, 'i');
  }
};

const buildAccountQuery = (filters: ExportFilters): ExportQuery | undefined => {
  const accountQuery: ExportQuery = {};
  const accountIds = asStringArray(filters.accountIds);

  if (accountIds?.length) {
    accountQuery._id = {
      [asBoolean(filters.accountExcludeIds) ? '$nin' : '$in']: accountIds,
    };
  }

  const directFields: Array<[string, string]> = [
    ['accountKind', 'kind'],
    ['accountStatus', 'status'],
    ['accountCategoryId', 'categoryId'],
    ['accountBrand', 'scopeBrandIds'],
    ['accountBranchId', 'branchId'],
    ['accountDepartmentId', 'departmentId'],
    ['accountCurrency', 'currency'],
    ['accountJournal', 'journal'],
  ];

  for (const [filterKey, queryKey] of directFields) {
    const value = asString(filters[filterKey]);
    if (value) {
      accountQuery[queryKey] =
        queryKey === 'scopeBrandIds' ? { $in: [value] } : value;
    }
  }

  const accountIsOutBalance = asBoolean(filters.accountIsOutBalance);
  if (accountIsOutBalance !== undefined) {
    accountQuery.isOutBalance = accountIsOutBalance;
  }

  const searchValue = asString(filters.accountSearchValue);
  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');
    accountQuery.$or = [
      { code: { $regex: regex } },
      { name: { $regex: regex } },
    ];
  }

  return Object.keys(accountQuery).length ? accountQuery : undefined;
};

const addAccountFilter = async (
  models: IModels,
  query: ExportQuery,
  filters: ExportFilters,
) => {
  const accountQuery = buildAccountQuery(filters);
  if (!accountQuery) {
    return;
  }

  const accounts = await models.Accounts.find(accountQuery, { _id: 1 }).lean();
  query['details.accountId'] = {
    $in: accounts.map((account) => String(account._id)),
  };
};

const buildTransactionQuery = async (
  models: IModels,
  filters?: ExportFilters,
): Promise<ExportQuery> => {
  const query: ExportQuery = {};

  if (!filters || Object.keys(filters).length === 0) {
    return query;
  }

  const ids = asStringArray(filters.ids);
  if (ids?.length) {
    query._id = { [asBoolean(filters.excludeIds) ? '$nin' : '$in']: ids };
  }

  const directFields = [
    'status',
    'mentionOwnerId',
    'createdUserId',
    'modifiedUserId',
    'journal',
    'branchId',
    'departmentId',
    'customerType',
    'customerId',
    'contentType',
    'contentId',
  ];

  for (const key of directFields) {
    const value = asString(filters[key]);
    if (!value) {
      continue;
    }

    const queryKey =
      key === 'createdUserId'
        ? 'createdBy'
        : key === 'modifiedUserId'
        ? 'modifiedBy'
        : key;

    query[queryKey] = value;
  }

  const statuses = asStringArray(filters.statuses);
  if (statuses?.length) {
    query.status = { $in: statuses };
  }

  const journals = asStringArray(filters.journals);
  if (journals?.length) {
    query.journal = { $in: journals };
  }

  const mentionUserId = asString(filters.mentionUserId);
  if (mentionUserId) {
    query.mentionUserIds = { $in: [mentionUserId] };
  }

  const currency = asString(filters.currency);
  if (currency) {
    query['details.currency'] = currency;
  }

  addRegexFilter(query, 'description', asString(filters.searchValue));

  const number = asString(filters.number);
  if (number) {
    const regex = new RegExp(`.*${escapeRegExp(number)}.*`, 'i');
    query.$or = [
      { number: { $regex: regex } },
      { ptrNumber: { $regex: regex } },
    ];
  }

  addDateRange(query, 'date', filters.startDate, filters.endDate);
  addDateRange(
    query,
    'updatedAt',
    filters.startUpdatedDate,
    filters.endUpdatedDate,
  );
  addDateRange(
    query,
    'createdAt',
    filters.startCreatedDate,
    filters.endCreatedDate,
  );

  await addAccountFilter(models, query, filters);

  return query;
};

const buildAccountLookup = async (
  models: IModels,
  transactions: ITransactionDocument[],
): Promise<AccountLookup> => {
  const accountIds = Array.from(
    new Set(
      transactions.flatMap((transaction) =>
        (transaction.details || [])
          .map((detail) => detail.accountId)
          .filter((accountId): accountId is string => Boolean(accountId)),
      ),
    ),
  );

  if (!accountIds.length) {
    return new Map();
  }

  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, name: 1, currency: 1 },
  ).lean();

  return new Map(
    accounts.map((account) => [
      String(account._id),
      {
        code: account.code,
        name: account.name,
        currency: account.currency,
      },
    ]),
  );
};

const formatDate = (value?: Date) =>
  value instanceof Date ? value.toISOString() : value ? String(value) : '';

const buildExportRow = (
  transaction: ITransactionDocument,
  detail: ITrDetail,
  accountLookup: AccountLookup,
): Record<string, unknown> => {
  const account = detail.accountId
    ? accountLookup.get(String(detail.accountId))
    : undefined;

  return {
    _id: String(transaction._id),
    date: formatDate(transaction.date),
    number: transaction.number,
    journal: transaction.journal,
    description: transaction.description,
    status: transaction.status,
    side: transaction.side,
    accountCode: account?.code,
    accountName: account?.name,
    branchId: detail.branchId || transaction.branchId,
    departmentId: detail.departmentId || transaction.departmentId,
    amount: detail.amount,
    currency: detail.currency || account?.currency,
    currencyAmount: detail.currencyAmount,
    customRate: detail.customRate,
    productId: detail.productId,
    fixedAssetId: detail.fixedAssetId,
    fixedAssetCode: detail.fixedAssetCode,
    fixedAssetName: detail.fixedAssetName,
    count: detail.count,
    unitPrice: detail.unitPrice,
    weight: detail.weight,
    customerType: transaction.customerType,
    customerId: transaction.customerId,
    createdBy: transaction.createdBy,
    modifiedBy: transaction.modifiedBy,
    createdAt: formatDate(transaction.createdAt),
    updatedAt: formatDate(transaction.updatedAt),
  };
};

export async function getTransactionExportData(
  data: GetExportData,
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, unknown>[]> {
  const { cursor, limit, filters, ids } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const baseQuery = await buildTransactionQuery(models, filters);
  const { query, isIdsMode } = buildExportCursorQuery({
    baseQuery,
    cursor,
    ids,
    limit,
  });

  if (isIdsMode && query._id?.$in?.length === 0) {
    return [];
  }

  const transactions = await models.Transactions.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  if (!transactions.length) {
    return [];
  }

  const typedTransactions = transactions as ITransactionDocument[];
  const accountLookup = await buildAccountLookup(models, typedTransactions);

  return typedTransactions.flatMap((transaction) =>
    (transaction.details || []).map((detail) =>
      buildExportRow(transaction, detail, accountLookup),
    ),
  );
}
