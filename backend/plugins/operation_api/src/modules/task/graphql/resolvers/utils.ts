import { ITaskDocument } from '@/task/@types/task';
import {
  buildCursorQuery,
  CursorResult,
  encodeCursor,
  PageInfo,
} from 'erxes-api-shared/utils';
import { FilterQuery, PipelineStage } from 'mongoose';
import { IModels } from '~/connectionResolvers';

const TASK_STATUS_NAMES = [
  'todo',
  'in progress',
  'pull request',
  'in planning',
  'merged',
  'updated',
  'cancelled',
  'on hold',
  'backlog',
] as const;

const TASK_STATUS_SORT = {
  statusOrder: 1,
  normalizedStatusName: 1,
  updatedAt: -1,
} as const;

interface IOrderedTaskDocument extends ITaskDocument {
  statusOrder?: number;
  normalizedStatusName?: string;
}

export const taskCursorPaginateByStatus = async ({
  models,
  params,
  query,
}: {
  models: IModels;
  params: {
    limit?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
  };
  query: FilterQuery<ITaskDocument>;
}): Promise<CursorResult<ITaskDocument>> => {
  const { limit = 20, cursor, direction = 'forward' } = params;

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const castingQuery = models.Task.find(query);
  castingQuery.cast();
  const castQuery = castingQuery.getFilter();

  const basePipeline: PipelineStage[] = [
    { $match: castQuery },
    {
      $lookup: {
        from: 'operation_statuses',
        localField: 'status',
        foreignField: '_id',
        as: 'statusDoc',
      },
    },
    {
      $addFields: {
        statusDoc: { $arrayElemAt: ['$statusDoc', 0] },
      },
    },
    {
      $addFields: {
        normalizedStatusName: {
          $toLower: {
            $trim: { input: { $ifNull: ['$statusDoc.name', ''] } },
          },
        },
      },
    },
    {
      $addFields: {
        statusOrder: {
          $let: {
            vars: {
              statusIndex: {
                $indexOfArray: [TASK_STATUS_NAMES, '$normalizedStatusName'],
              },
            },
            in: {
              $cond: [
                { $eq: ['$$statusIndex', -1] },
                TASK_STATUS_NAMES.length,
                '$$statusIndex',
              ],
            },
          },
        },
      },
    },
    { $project: { statusDoc: 0 } },
  ];

  const cursorQuery = cursor
    ? buildCursorQuery(cursor, TASK_STATUS_SORT, direction, {
        statusOrder: 'number',
        updatedAt: 'date',
      })
    : null;

  const sortOrder: Record<string, 1 | -1> = {};
  for (const [field, order] of Object.entries(TASK_STATUS_SORT)) {
    const reverseOrder = order === 1 ? -1 : 1;
    sortOrder[field] = direction === 'forward' ? order : reverseOrder;
  }
  sortOrder._id = direction === 'forward' ? 1 : -1;

  const cursorPipeline: PipelineStage[] = cursorQuery
    ? [{ $match: cursorQuery }]
    : [];
  const listPipeline: PipelineStage[] = [
    ...basePipeline,
    ...cursorPipeline,
    { $sort: sortOrder },
    { $limit: limit + 1 },
  ];

  const [items, totalCount] = await Promise.all([
    models.Task.aggregate<IOrderedTaskDocument>(listPipeline).allowDiskUse(
      true,
    ),
    models.Task.countDocuments(query),
  ]);

  const hasMore = items.length > limit;
  let list = hasMore ? items.slice(0, limit) : items;

  if (direction === 'backward') {
    list = list.reverse();
  }

  const sortFields = Object.keys(TASK_STATUS_SORT);
  const startCursor = list.length ? encodeCursor(list[0], sortFields) : null;
  const endCursor = list.length
    ? encodeCursor(list[list.length - 1], sortFields)
    : null;

  const pageInfo: PageInfo = {
    hasNextPage: direction === 'forward' ? hasMore : Boolean(cursor),
    hasPreviousPage: direction === 'backward' ? hasMore : Boolean(cursor),
    startCursor,
    endCursor,
  };

  return {
    list,
    totalCount,
    pageInfo,
  };
};
