import { FilterQuery, Model, PipelineStage } from 'mongoose';
import { ITransactionDocument } from '../@types/transaction';

type TDirection = 'forward' | 'backward';

type TRecordCursor = {
  ptrNumber: string | null;
  ptrId: string | null;
  trId: string;
  detailInd: number;
};

type TRecordRow = {
  _id: string;
  ptrNumber?: string | null;
  ptrId?: string | null;
  trId: string;
  detailInd: number;
};

type TPaginateTrRecordsParams = {
  model: Model<ITransactionDocument>;
  filter: FilterQuery<ITransactionDocument>;
  limit: number;
  cursor?: string;
  direction?: TDirection;
};

/**
 * Records are ordered by transaction (ptrNumber desc, ptrId desc, _id asc)
 * and then by detail index. Sorting happens on whole transactions before
 * `$unwind`, so MongoDB walks the `{ ptrNumber: -1, ptrId: -1, _id: 1 }`
 * indexes and stops after one page instead of unwinding the collection.
 */
const TRANSACTION_SORT = { ptrNumber: -1, ptrId: -1, _id: 1 } as const;

const REVERSED_TRANSACTION_SORT = {
  ptrNumber: 1,
  ptrId: 1,
  _id: -1,
} as const;

const encodeRecordCursor = (row: TRecordRow): string =>
  Buffer.from(
    JSON.stringify({
      ptrNumber: row.ptrNumber ?? null,
      ptrId: row.ptrId ?? null,
      trId: row.trId,
      detailInd: row.detailInd,
    }),
  ).toString('base64');

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

/**
 * Returns undefined for cursors that are not in this format, such as cursors
 * issued by the previous generic aggregation pager and kept in a browser
 * session; those restart from the first page.
 */
const decodeRecordCursor = (cursor?: string): TRecordCursor | undefined => {
  if (!cursor) {
    return;
  }

  try {
    const data = JSON.parse(Buffer.from(cursor, 'base64').toString());

    if (
      typeof data?.trId === 'string' &&
      Number.isInteger(data.detailInd) &&
      isNullableString(data.ptrNumber) &&
      isNullableString(data.ptrId)
    ) {
      return data;
    }
  } catch {
    return;
  }

  return;
};

/**
 * Conditions that place a descending-sorted field strictly after `value` in
 * traversal order. MongoDB sorts null/missing below strings, so moving down
 * from a string also reaches null values and moving up from null reaches
 * every non-null value.
 */
const pastDescendingField = (
  field: string,
  value: string | null,
  direction: TDirection,
): Record<string, unknown>[] => {
  if (direction === 'forward') {
    return value === null
      ? []
      : [{ [field]: { $lt: value } }, { [field]: null }];
  }

  return value === null
    ? [{ [field]: { $ne: null } }]
    : [{ [field]: { $gt: value } }];
};

const buildTransactionCursorMatch = (
  cursor: TRecordCursor,
  direction: TDirection,
) => ({
  $or: [
    ...pastDescendingField('ptrNumber', cursor.ptrNumber, direction),
    ...pastDescendingField('ptrId', cursor.ptrId, direction).map(
      (condition) => ({ ptrNumber: cursor.ptrNumber, ...condition }),
    ),
    {
      ptrNumber: cursor.ptrNumber,
      ptrId: cursor.ptrId,
      _id: { [direction === 'forward' ? '$gte' : '$lte']: cursor.trId },
    },
  ],
});

const buildUnwindStages = (direction: TDirection): PipelineStage[] => {
  if (direction === 'forward') {
    return [{ $unwind: { path: '$details', includeArrayIndex: 'detailInd' } }];
  }

  // Walk details last-to-first while keeping their original indexes.
  return [
    {
      $set: {
        __detailCount: { $size: { $ifNull: ['$details', []] } },
        details: { $reverseArray: { $ifNull: ['$details', []] } },
      },
    },
    { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
    {
      $set: {
        detailInd: {
          $subtract: [{ $subtract: ['$__detailCount', 1] }, '$detailInd'],
        },
      },
    },
    { $unset: '__detailCount' },
  ];
};

const RECORD_ROOT_STAGE: PipelineStage = {
  $replaceRoot: {
    newRoot: {
      $mergeObjects: [
        '$$ROOT',
        {
          _id: {
            $concat: [
              { $toString: '$_id' },
              '-',
              {
                $ifNull: [
                  { $toString: '$details._id' },
                  { $toString: '$detailInd' },
                ],
              },
            ],
          },
        },
        { trId: '$_id' },
      ],
    },
  },
};

export const countTrRecords = async (
  model: Model<ITransactionDocument>,
  filter: FilterQuery<ITransactionDocument>,
): Promise<number> => {
  const [result] = await model.aggregate<{ count: number }>([
    { $match: filter },
    {
      $group: {
        _id: null,
        count: { $sum: { $size: { $ifNull: ['$details', []] } } },
      },
    },
  ]);

  return result?.count ?? 0;
};

export const paginateTrRecords = async ({
  model,
  filter,
  limit,
  cursor,
  direction = 'forward',
}: TPaginateTrRecordsParams) => {
  const cursorData = decodeRecordCursor(cursor);

  const pipeline: PipelineStage[] = [
    {
      $match: cursorData
        ? { $and: [filter, buildTransactionCursorMatch(cursorData, direction)] }
        : filter,
    },
    {
      $sort:
        direction === 'forward' ? TRANSACTION_SORT : REVERSED_TRANSACTION_SORT,
    },
    ...buildUnwindStages(direction),
  ];

  if (cursorData) {
    pipeline.push({
      $match: {
        $or: [
          { _id: { $ne: cursorData.trId } },
          {
            detailInd: {
              [direction === 'forward' ? '$gt' : '$lt']: cursorData.detailInd,
            },
          },
        ],
      },
    });
  }

  pipeline.push({ $limit: limit + 1 }, RECORD_ROOT_STAGE);

  const [rows, totalCount] = await Promise.all([
    model.aggregate<TRecordRow>(pipeline),
    countTrRecords(model, filter),
  ]);

  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const list = direction === 'backward' ? pageRows.reverse() : pageRows;
  const hasCursor = Boolean(cursorData);

  return {
    list,
    totalCount,
    pageInfo: {
      hasNextPage: direction === 'forward' ? hasMore : hasCursor,
      hasPreviousPage: direction === 'backward' ? hasMore : hasCursor,
      startCursor: list.length ? encodeRecordCursor(list[0]) : null,
      endCursor: list.length ? encodeRecordCursor(list[list.length - 1]) : null,
    },
  };
};
