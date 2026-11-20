import { checkPermissionGroup } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { fixNum, sendTRPCMessage } from 'erxes-api-shared/utils';
import sift from 'sift';
import { IModels } from '~/connectionResolvers';
import { getPermittedTransactionJournals } from '@/accounting/utils/transactionPermissions';
import { ITrDetail } from '@/accounting/@types/transaction';
import {
  applyReadTransactionJournalFilter,
  generateFilter,
  queryTransactionsMain,
  queryTrRecordsMain,
  TTrRecordListParams,
} from '@/accounting/graphql/resolvers/queries/transactionsCommon';

export const LIST_CHANGE_ROWS_LIMIT = 100;

const PAGING_PARAMS = new Set([
  'ids',
  'excludeIds',
  'cursor',
  'cursorMode',
  'direction',
  'limit',
  'orderBy',
]);

const DATE_FIELDS = ['date', 'createdAt', 'updatedAt'];

type TStructure = { _id: string; code?: string; title?: string };

type TPtrMember = {
  sumDt?: number;
  sumCt?: number;
  originId?: string;
  ptrStatus?: string;
};

type TListRow = {
  _id?: string | null;
  ptrId?: string | null;
  branchId?: string | null;
  departmentId?: string | null;
  vatRowId?: string | null;
  ctaxRowId?: string | null;
  details?: ITrDetail | ITrDetail[] | null;
  shortDetail?: ITrDetail | null;
};

type TChangedDoc = Record<string, unknown> | null | undefined;

export type TListChangeKind = 'transactions' | 'trRecords';

export const EMPTY_PTR_INFO = {
  len: 0,
  activeLen: 0,
  status: 'None',
  diff: 0,
  value: 0,
};

export const summarizePtr = (perPtrTrs: TPtrMember[]) => {
  const debit = perPtrTrs.reduce((sum, tr) => (tr.sumDt ?? 0) + sum, 0);
  const credit = perPtrTrs.reduce((sum, tr) => (tr.sumCt ?? 0) + sum, 0);

  return {
    len: perPtrTrs.length,
    activeLen: perPtrTrs.filter((tr) => !tr.originId).length,
    status: perPtrTrs[0]?.ptrStatus,
    diff: fixNum(Math.abs(debit - credit), 4),
    value: fixNum(Math.max(debit, credit), 4),
  };
};

const unique = (values: (string | null | undefined)[]) => [
  ...new Set(values.filter((value): value is string => !!value)),
];

const byId = <T extends { _id: unknown }>(docs: T[]) =>
  new Map(docs.map((doc) => [String(doc._id), doc]));

const groupBy = <T>(docs: T[], getKey: (doc: T) => string | undefined) =>
  docs.reduce<Map<string, T[]>>((groups, doc) => {
    const key = getKey(doc);

    if (key) {
      groups.set(key, [...(groups.get(key) ?? []), doc]);
    }

    return groups;
  }, new Map());

const rowDetails = (row: TListRow) => {
  const details = Array.isArray(row.details) ? row.details : [row.details];
  return [...details, row.shortDetail].filter(
    (detail): detail is ITrDetail => !!detail,
  );
};

const findStructures = async (
  subdomain: string,
  module: 'branches' | 'departments',
  ids: string[],
): Promise<TStructure[]> => {
  if (!ids.length) {
    return [];
  }

  return await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action: 'find',
    input: {
      query: { _id: { $in: ids } },
      fields: { _id: 1, code: 1, title: 1 },
    },
    defaultValue: [],
    throwOnError: true,
  });
};

export const resolveTransactionListRows = async <T extends TListRow>(
  models: IModels,
  subdomain: string,
  rows: T[],
) => {
  if (!rows.length) {
    return [];
  }

  const followTrs = await models.Transactions.find({
    originId: { $in: unique(rows.map((row) => row._id)) },
  }).lean();

  const allRows: TListRow[] = [...rows, ...followTrs];
  const details = allRows.flatMap(rowDetails);

  const [accounts, branches, departments, vatRows, ctaxRows, ptrMembers] =
    await Promise.all([
      models.Accounts.find({
        _id: { $in: unique(details.map((detail) => detail.accountId)) },
      }).lean(),
      findStructures(
        subdomain,
        'branches',
        unique([
          ...allRows.map((row) => row.branchId),
          ...details.map((detail) => detail.branchId),
        ]),
      ),
      findStructures(
        subdomain,
        'departments',
        unique([
          ...allRows.map((row) => row.departmentId),
          ...details.map((detail) => detail.departmentId),
        ]),
      ),
      models.VatRows.find({
        _id: { $in: unique(rows.map((row) => row.vatRowId)) },
      }).lean(),
      models.CtaxRows.find({
        _id: { $in: unique(rows.map((row) => row.ctaxRowId)) },
      }).lean(),
      models.Transactions.find(
        { ptrId: { $in: unique(rows.map((row) => row.ptrId)) } },
        { ptrId: 1, sumDt: 1, sumCt: 1, originId: 1, ptrStatus: 1 },
      ).lean(),
    ]);

  const accountsById = byId(accounts);
  const branchesById = byId(branches);
  const departmentsById = byId(departments);
  const vatRowsById = byId(vatRows);
  const ctaxRowsById = byId(ctaxRows);
  const followTrsByOrigin = groupBy(followTrs, (tr) => tr.originId);
  const ptrMembersByPtr = groupBy(ptrMembers, (tr) => tr.ptrId);

  const withDetailRefs = (detail?: ITrDetail | null) =>
    detail && {
      ...detail,
      account: accountsById.get(detail.accountId) ?? null,
      branch: (detail.branchId && branchesById.get(detail.branchId)) || null,
      department:
        (detail.departmentId && departmentsById.get(detail.departmentId)) ||
        null,
    };

  const withRefs = <R extends TListRow>(row: R) => ({
    ...row,
    branch: (row.branchId && branchesById.get(row.branchId)) || null,
    department:
      (row.departmentId && departmentsById.get(row.departmentId)) || null,
    details: Array.isArray(row.details)
      ? row.details.map(withDetailRefs)
      : withDetailRefs(row.details),
    shortDetail: withDetailRefs(row.shortDetail),
  });

  return rows.map((row) => ({
    ...withRefs(row),
    followTrs: (followTrsByOrigin.get(String(row._id)) ?? []).map(withRefs),
    vatRow: (row.vatRowId && vatRowsById.get(row.vatRowId)) || null,
    ctaxRow: (row.ctaxRowId && ctaxRowsById.get(row.ctaxRowId)) || null,
    ptrInfo: row.ptrId
      ? summarizePtr(ptrMembersByPtr.get(row.ptrId) ?? [])
      : EMPTY_PTR_INFO,
  }));
};

const withoutPaging = (filter: Record<string, unknown> | undefined) =>
  Object.fromEntries(
    Object.entries(filter ?? {}).filter(([key]) => !PAGING_PARAMS.has(key)),
  );

const toListParams = (
  filter: Record<string, unknown> | undefined,
  trIds: string[],
) =>
  ({
    ...withoutPaging(filter),
    ids: trIds,
    limit: LIST_CHANGE_ROWS_LIMIT,
  } as TTrRecordListParams);

const toCountParams = (filter: Record<string, unknown> | undefined) =>
  ({ ...withoutPaging(filter), limit: 1 } as TTrRecordListParams);

const withDateFields = (doc: Record<string, unknown>) => ({
  ...doc,
  ...Object.fromEntries(
    DATE_FIELDS.filter((field) => doc[field]).map((field) => [
      field,
      new Date(doc[field] as string | number | Date),
    ]),
  ),
});

const findActiveUser = async (
  subdomain: string,
  userId: string,
  throwOnError = false,
): Promise<IUserDocument | null> =>
  await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'findOne',
    input: { query: { _id: userId, isActive: { $ne: false } } },
    defaultValue: null,
    throwOnError,
  });

export const getListFilterMatches = async ({
  models,
  subdomain,
  userId,
  filter,
  oldDocs,
  newDocs,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  filter: TTrRecordListParams;
  oldDocs: TChangedDoc[];
  newDocs: TChangedDoc[];
}) => {
  const user = await findActiveUser(subdomain, userId, true);

  if (!user?._id) {
    return { matchesOld: false, matchesNew: false };
  }

  const filterParams = await generateFilter(subdomain, models, filter, user);
  await applyReadTransactionJournalFilter(
    filterParams,
    user,
    checkPermissionGroup(subdomain, user),
  );

  const matches = sift(filterParams);
  const anyMatch = (docs: TChangedDoc[]) =>
    docs.some((doc) => !!doc && matches(withDateFields(doc)));

  return { matchesOld: anyMatch(oldDocs), matchesNew: anyMatch(newDocs) };
};

export const getListChangeRows = async ({
  models,
  subdomain,
  userId,
  list,
  trIds,
  trJournals = {},
  filter,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  list: TListChangeKind;
  trIds: string[];
  trJournals?: Record<string, string[]>;
  filter?: Record<string, unknown>;
}) => {
  const user = await findActiveUser(subdomain, userId);

  if (!user?._id) {
    return { trIds: [], list: [], hasMore: true, totalCount: null };
  }

  const context = {
    models,
    subdomain,
    user,
    checkPermission: checkPermissionGroup(subdomain, user),
  };

  const readableJournals = await getPermittedTransactionJournals(
    context,
    'read',
  );
  const readableTrIds = trIds.filter((trId) =>
    (trJournals[trId] ?? []).some((journal) =>
      readableJournals.includes(journal),
    ),
  );

  if (!readableTrIds.length) {
    return { trIds: [], list: [], hasMore: false, totalCount: null };
  }

  const toChange = async <T extends TListRow>(
    load: (params: TTrRecordListParams) => Promise<{
      list: T[];
      totalCount?: number | null;
      pageInfo?: { hasNextPage?: boolean } | null;
    }>,
  ) => {
    const [changed, all] = await Promise.all([
      load(toListParams(filter, readableTrIds)),
      load(toCountParams(filter)),
    ]);

    return {
      trIds: readableTrIds,
      list: await resolveTransactionListRows(models, subdomain, changed.list),
      hasMore: Boolean(changed.pageInfo?.hasNextPage),
      totalCount: all.totalCount ?? null,
    };
  };

  if (list === 'trRecords') {
    return await toChange((params) => queryTrRecordsMain(context, params));
  }

  return await toChange((params) => queryTransactionsMain(context, params));
};
