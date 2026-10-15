import { STATUS_TYPES } from '../../status/constants/types';

const DATE_RANGE_FIELDS = [
  ['startDate', 'startDateStartDate', 'startDateEndDate'],
  ['targetDate', 'targetDateStartDate', 'targetDateEndDate'],
  ['createdAt', 'createdStartDate', 'createdEndDate'],
  ['updatedAt', 'updatedStartDate', 'updatedEndDate'],
  ['statusChangedDate', 'completedStartDate', 'completedEndDate'],
] as const;

type DateCondition = { $gte?: Date; $lte?: Date };
type TaskDateQuery = Partial<
  Record<(typeof DATE_RANGE_FIELDS)[number][0], DateCondition>
> & { statusType?: number };

const parseDateBound = (value: unknown): Date | undefined => {
  if (value === undefined || value === null) return undefined;
  if (!(value instanceof Date) && typeof value !== 'string') {
    throw new Error('Task date bounds must be valid dates');
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Task date bounds must be valid dates');
  }
  return date;
};

export const buildTaskDateRangeQuery = (filter: object): TaskDateQuery => {
  const values: Record<string, unknown> = { ...filter };
  const query: TaskDateQuery = {};

  for (const [field, startKey, endKey] of DATE_RANGE_FIELDS) {
    const from = parseDateBound(values[startKey]);
    const to = parseDateBound(values[endKey]);
    if (!from && !to) continue;
    if (from && to && from > to) {
      throw new Error('Task date range start must be before its end');
    }

    query[field] = {
      ...(from && { $gte: from }),
      ...(to && { $lte: to }),
    };
    if (field === 'statusChangedDate') {
      query.statusType = STATUS_TYPES.COMPLETED;
    }
  }

  return query;
};
