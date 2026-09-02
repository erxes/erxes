import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

export type SegmentCollection = {
  bulkWrite: SegmentMembershipCollection['bulkWrite'];
  countDocuments: (
    filter: Record<string, unknown>,
    options?: { maxTimeMS?: number },
  ) => Promise<number>;
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => {
    lean: () => Promise<
      (Record<string, unknown> & { _id: string; segmentIds?: string[] })[]
    >;
    sort: (order: Record<string, 1>) => {
      limit: (count: number) => { lean: () => Promise<{ _id: string }[]> };
    };
  };
  aggregate: (
    pipeline: Record<string, unknown>[],
  ) => Promise<Record<string, unknown>[]>;
};

export type SegmentSource = {
  collection: SegmentCollection;
  baseQuery: Record<string, unknown>;
};

export const segmentSource = (
  models: IModels,
  contentType: string,
): SegmentSource | null => {
  const as = (model: unknown) => model as SegmentCollection;

  if (contentType === 'core:contacts.customers') {
    return {
      collection: as(models.Customers),
      baseQuery: { state: { $ne: 'lead' } },
    };
  }

  if (contentType === 'core:contacts.leads') {
    return { collection: as(models.Customers), baseQuery: { state: 'lead' } };
  }

  if (contentType === 'core:contacts.companies') {
    return { collection: as(models.Companies), baseQuery: {} };
  }

  if (contentType === 'core:organization.users') {
    return { collection: as(models.Users), baseQuery: {} };
  }

  if (contentType === 'core:products.products') {
    return {
      collection: as(models.Products),
      baseQuery: { status: { $ne: 'deleted' } },
    };
  }

  return null;
};

export const coreSegmentOwnedSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  const backing = segmentSource(models, contentType);

  if (!backing) {
    return null;
  }

  return {
    find: (query, projection) =>
      backing.collection.find(query, projection).lean(),
    aggregate: (pipeline) => backing.collection.aggregate(pipeline),
    baseQuery: backing.baseQuery,
  };
};
