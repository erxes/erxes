import { TR_STATUS_GROUPS } from '@/transactions/types/constants';

type TrRecordRef = {
  parentId?: string | null;
};

type ParentTr = {
  _id?: string | null;
  parentId?: string | null;
  number?: string | null;
  date?: unknown;
  journal?: string | null;
  status?: string | null;
  details?: readonly unknown[] | null;
};

export type TrRecordsByParentId = Record<string, readonly ParentTr[]>;

export type TrRecordsDeleteTransaction = {
  _id: string;
  number?: string | null;
  date?: unknown;
  journal?: string | null;
  lineCount: number;
};

export type TrRecordsDeleteScope = {
  transactions: TrRecordsDeleteTransaction[];
  lineCount: number;
  hasPublished: boolean;
};

const PUBLISHED_STATUSES =
  TR_STATUS_GROUPS.find((group) => group.label === 'PUBLISHED')?.values ?? [];

export const getTrRecordsParents = <T extends TrRecordRef>(records: T[]) => {
  const parents = new Map<string, T & { parentId: string }>();

  records.forEach((record) => {
    const { parentId } = record;

    if (parentId && !parents.has(parentId)) {
      parents.set(parentId, { ...record, parentId });
    }
  });

  return [...parents.values()];
};

export const buildTrRecordsDeleteScope = (
  records: TrRecordRef[],
  trsByParentId: TrRecordsByParentId,
): TrRecordsDeleteScope => {
  const removedTrs = getTrRecordsParents(records).flatMap(({ parentId }) =>
    (trsByParentId[parentId] ?? []).filter(
      (tr): tr is ParentTr & { _id: string } =>
        tr.parentId === parentId && Boolean(tr._id),
    ),
  );

  const transactions = removedTrs.map(
    ({ _id, number, date, journal, details }) => ({
      _id,
      number,
      date,
      journal,
      lineCount: details?.length ?? 0,
    }),
  );

  return {
    transactions,
    lineCount: transactions.reduce((sum, tr) => sum + tr.lineCount, 0),
    hasPublished: removedTrs.some((tr) =>
      PUBLISHED_STATUSES.includes(tr.status ?? ''),
    ),
  };
};
