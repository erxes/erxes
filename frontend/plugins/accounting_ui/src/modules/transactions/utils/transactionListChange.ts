import { isReference } from '@apollo/client';
import type { ApolloCache, Reference } from '@apollo/client';
import type { ModifierDetails } from '@apollo/client/cache';

type TListRow = {
  _id?: string | null;
  trId?: string | null;
  ptrId?: string | null;
  ptrNumber?: string | null;
  detailInd?: number | null;
};

type TListResult<T> = {
  list?: (T | null)[] | null;
  totalCount?: number | null;
  pageInfo?: {
    hasNextPage?: boolean | null;
    hasPreviousPage?: boolean | null;
  } | null;
};

type TListChange<T> = {
  trIds?: (string | null)[] | null;
  list?: (T | null)[] | null;
  totalCount?: number | null;
};

type TCachedList = {
  list?: (Reference | null)[] | null;
  totalCount?: number | null;
};

const NON_FILTER_VARIABLES = new Set([
  'cursor',
  'cursorMode',
  'direction',
  'limit',
  'orderBy',
]);

const isRow = <T>(row: T | null | undefined): row is T => !!row;

const getTrId = (row: TListRow) => row.trId ?? row._id ?? '';

const compareDesc = (a?: string | null, b?: string | null) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return a > b ? -1 : 1;
};

const compareAsc = (a: string, b: string) => {
  if (a === b) return 0;
  return a > b ? 1 : -1;
};

export const compareListRows = (a: TListRow, b: TListRow) =>
  compareDesc(a.ptrNumber, b.ptrNumber) ||
  compareDesc(a.ptrId, b.ptrId) ||
  compareAsc(getTrId(a), getTrId(b)) ||
  (a.detailInd ?? 0) - (b.detailInd ?? 0);

const countByTrId = <T extends TListRow>(rows: T[]) =>
  rows.reduce<Map<string, number>>((counts, row) => {
    const trId = getTrId(row);
    counts.set(trId, (counts.get(trId) ?? 0) + 1);
    return counts;
  }, new Map());

export const toListSubscriptionFilter = (variables: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(variables).filter(
      ([key, value]) =>
        !NON_FILTER_VARIABLES.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== '',
    ),
  );

export const applyListChange = <T extends TListRow, R extends TListResult<T>>(
  prev: R,
  change: TListChange<T>,
): R => {
  const changedTrIds = new Set(change.trIds?.filter(isRow));

  if (!changedTrIds.size) {
    return prev;
  }

  const rows = prev.list?.filter(isRow) ?? [];
  const list = rows.filter((row) => !changedTrIds.has(getTrId(row)));
  const { hasNextPage, hasPreviousPage } = prev.pageInfo ?? {};
  const isPartialPage = Boolean(hasNextPage || hasPreviousPage);

  const incoming = (change.list?.filter(isRow) ?? [])
    .filter((row) => changedTrIds.has(getTrId(row)))
    .sort(compareListRows);

  const firstRow = rows[0];
  const lastRow = rows[rows.length - 1];

  for (const row of incoming) {
    const isBeforePage =
      Boolean(hasPreviousPage) &&
      !!firstRow &&
      compareListRows(row, firstRow) < 0;
    const isAfterPage =
      Boolean(hasNextPage) && !!lastRow && compareListRows(row, lastRow) > 0;

    if (isBeforePage || isAfterPage) {
      continue;
    }

    const index = list.findIndex((item) => compareListRows(row, item) < 0);
    list.splice(index === -1 ? list.length : index, 0, row);
  }

  const oldCounts = countByTrId(
    rows.filter((row) => changedTrIds.has(getTrId(row))),
  );
  const newCounts = countByTrId(incoming);

  const countDelta = [...changedTrIds].reduce((delta, trId) => {
    const oldCount = oldCounts.get(trId) ?? 0;

    if (!oldCount && isPartialPage) {
      return delta;
    }

    return delta + (newCounts.get(trId) ?? 0) - oldCount;
  }, 0);

  return {
    ...prev,
    list,
    totalCount:
      change.totalCount ?? Math.max((prev.totalCount ?? 0) + countDelta, 0),
  };
};

type TCachedLists = {
  accTransactionsMain: TCachedList;
  accTrRecordsMain: TCachedList;
};

const removeParentRows = (
  existing: Reference | TCachedList,
  { readField }: ModifierDetails,
  parentId: string,
) => {
  if (isReference(existing) || !existing.list) {
    return existing;
  }

  const list = existing.list.filter(
    (item) => !item || readField('parentId', item) !== parentId,
  );
  const removedCount = existing.list.length - list.length;

  if (!removedCount) {
    return existing;
  }

  return {
    ...existing,
    list,
    totalCount: Math.max((existing.totalCount ?? 0) - removedCount, 0),
  };
};

export const removeTransactionParentFromCache = (
  cache: ApolloCache<unknown>,
  parentId?: string | null,
) => {
  if (!parentId) {
    return;
  }

  cache.modify<TCachedLists>({
    fields: {
      accTransactionsMain: (existing, details) =>
        removeParentRows(existing, details, parentId),
      accTrRecordsMain: (existing, details) =>
        removeParentRows(existing, details, parentId),
    },
  });
};
