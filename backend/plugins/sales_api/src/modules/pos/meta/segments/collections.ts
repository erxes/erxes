import {
  SegmentMembershipCollection,
  SegmentOwnedSource,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { POS_ORDER_TYPE } from './fields';

/**
 * Which collection backs each content type this module owns.
 *
 * Declared once because everything that touches records reads it - listing
 * members, resolving values, measuring a relation, writing membership - and a
 * content type added to one but not the others is a segment that silently
 * answers nothing.
 */

type OrderCollection = {
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

export const posOrderCollection = (
  models: IModels,
  contentType: string,
): OrderCollection | null =>
  contentType === POS_ORDER_TYPE
    ? (models.PosOrders as unknown as OrderCollection)
    : null;

export const posSegmentSource = (
  models: IModels,
  contentType: string,
): SegmentOwnedSource | null => {
  const collection = posOrderCollection(models, contentType);

  if (!collection) {
    return null;
  }

  return {
    find: (query, projection) => collection.find(query, projection).lean(),
    aggregate: (pipeline) => collection.aggregate(pipeline),
  };
};

/** The same collection, for the write that records who matched. */
export const posMembershipCollections = (
  models: IModels,
): Record<string, SegmentMembershipCollection> => ({
  [POS_ORDER_TYPE]: models.PosOrders as unknown as SegmentMembershipCollection,
});
