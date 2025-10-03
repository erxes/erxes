import {
  buildCursorQuery,
  encodeCursor,
  PageInfo,
} from 'erxes-api-shared/utils';
import { FilterQuery, SortOrder } from 'mongoose';
import { ITaskDocument } from '@/task/@types/task';
import { IModels } from '~/connectionResolvers';

export const taskCursorPaginationWithAggregation = async ({
  models,
  params,
  query,
}: {
  models: IModels;
  params: {
    limit?: number;
    cursor?: string;
    direction?: 'forward' | 'backward';
    orderBy?: Record<string, SortOrder>;
  };
  query: FilterQuery<ITaskDocument>;
}) => {
  const { limit = 20, cursor, direction = 'forward', orderBy = {} } = params;

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const baseQuery = { ...query };
  if (cursor) {
    const cursorQuery = buildCursorQuery(cursor, orderBy, direction);
    Object.assign(baseQuery, cursorQuery);
  }

  const sortFields = ['customSortOrder'];

  const [items, totalCount] = await Promise.all([
    models.Task.aggregate([
      { $match: baseQuery as FilterQuery<ITaskDocument> },
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
          customSortOrder: {
            $switch: {
              branches: [
                { case: { $eq: ['$statusDoc.type', 'backlog'] }, then: 2 },
                { case: { $eq: ['$statusDoc.type', 'unstarted'] }, then: 1 },
                { case: { $eq: ['$statusDoc.type', 'started'] }, then: 0 },
                { case: { $eq: ['$statusDoc.type', 'completed'] }, then: 3 },
                { case: { $eq: ['$statusDoc.type', 'cancelled'] }, then: 4 },
              ],
              default: 99,
            },
          },
        },
      },
      { $sort: { customSortOrder: 1, _id: 1 } },
      { $limit: limit + 1 },
    ]),
    models.Task.countDocuments(query as FilterQuery<ITaskDocument>),
  ]);

  const hasMore = items.length > limit;
  let list = hasMore ? items.slice(0, limit) : items;

  if (direction === 'backward') {
    list = list.reverse();
  }

  const startCursor =
    list.length > 0 ? encodeCursor(list[0], sortFields) : null;
  const endCursor =
    list.length > 0 ? encodeCursor(list[list.length - 1], sortFields) : null;

  const pageInfo: PageInfo = {
    hasNextPage: direction === 'forward' ? hasMore : Boolean(cursor),
    hasPreviousPage: direction === 'backward' ? hasMore : Boolean(cursor),
    startCursor,
    endCursor,
  };

  return {
    list: list as ITaskDocument[],
    totalCount,
    pageInfo,
  };
};
