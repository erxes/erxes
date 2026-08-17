import { cursorPaginateAggregation } from 'erxes-api-shared/utils';
import type { FilterQuery, PipelineStage, SortOrder } from 'mongoose';
import type { ITaskDocument } from '@/task/@types/task';
import type { IModels } from '~/connectionResolvers';

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
  const { limit = 20, cursor, direction = 'forward' } = params;

  const pipeline: PipelineStage[] = [
    { $match: query },
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
  ];

  return cursorPaginateAggregation<ITaskDocument>({
    model: models.Task,
    pipeline,
    params: {
      limit,
      cursor,
      direction,
      orderBy: { customSortOrder: 1, _id: 1 },
    },
    query,
  });
};
