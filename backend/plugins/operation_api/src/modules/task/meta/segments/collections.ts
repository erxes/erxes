import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { TASK_TYPE } from './fields';

type TaskCollection = {
  countDocuments: (filter: Record<string, unknown>) => Promise<number>;
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => {
    lean: () => Promise<Record<string, unknown>[]>;
    sort: (order: Record<string, 1>) => {
      limit: (count: number) => { lean: () => Promise<{ _id: string }[]> };
    };
  };
  aggregate: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;
};

export const taskCollection = (
  models: IModels,
  contentType: string,
): TaskCollection | null =>
  contentType === TASK_TYPE ? (models.Task as unknown as TaskCollection) : null;

export const taskSegmentSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  const collection = taskCollection(models, contentType);

  if (!collection) {
    return null;
  }

  return {
    find: (query, projection) => collection.find(query, projection).lean(),
    aggregate: (pipeline) => collection.aggregate(pipeline),
  };
};

export const taskMembershipCollections = (
  models: IModels,
): Record<string, SegmentMembershipCollection> => ({
  [TASK_TYPE]: models.Task as unknown as SegmentMembershipCollection,
});
