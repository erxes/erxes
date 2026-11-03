import { TR_STATUS_GROUPS } from '@/transactions/types/constants';

type TrRecordRef = {
  parentId?: string | null;
  number?: string | null;
  date?: unknown;
};

type ParentTr = {
  status?: string | null;
  details?: readonly unknown[] | null;
};

export type TrRecordsByParentId = Record<string, readonly ParentTr[]>;

export type TrRecordsDeleteTransaction = {
  parentId: string;
  number?: string | null;
  date?: unknown;
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
  const transactions = getTrRecordsParents(records).map(
    ({ parentId, number, date }) => {
      const trs = trsByParentId[parentId] ?? [];

      return {
        parentId,
        number,
        date,
        lineCount: trs.reduce((sum, tr) => sum + (tr.details?.length ?? 0), 0),
      };
    },
  );

  return {
    transactions,
    lineCount: transactions.reduce((sum, tr) => sum + tr.lineCount, 0),
    hasPublished: Object.values(trsByParentId).some((trs) =>
      trs.some((tr) => PUBLISHED_STATUSES.includes(tr.status ?? '')),
    ),
  };
};
