import { SegmentMembershipCollection } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/**
 * Which collection backs each content type core owns.
 *
 * Declared once because two things read it - listing members and writing
 * membership - and a content type added to one but not the other is a segment
 * that silently lists nobody or never records who it matched.
 */

/**
 * Declared as one shape rather than intersected with the shared membership
 * type: both need `find`, and two declarations of it would leave a call
 * matching only whichever overload came first.
 */
export type SegmentCollection = {
  bulkWrite: SegmentMembershipCollection['bulkWrite'];
  countDocuments: SegmentMembershipCollection['countDocuments'];
  find: (
    query: Record<string, unknown>,
    projection?: Record<string, 1>,
  ) => {
    lean: () => Promise<{ _id: string; segmentIds?: string[] }[]>;
    sort: (order: Record<string, 1>) => {
      limit: (count: number) => { lean: () => Promise<{ _id: string }[]> };
    };
  };
};

export type SegmentSource = {
  collection: SegmentCollection;
  /** What always narrows this content type within its collection. */
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

  // A lead lives in the contacts collection, so its state is part of the query
  // rather than a collection of its own.
  if (contentType === 'core:contacts.leads') {
    return { collection: as(models.Customers), baseQuery: { state: 'lead' } };
  }

  if (contentType === 'core:contacts.companies') {
    return { collection: as(models.Companies), baseQuery: {} };
  }

  if (contentType === 'core:organization.users') {
    return { collection: as(models.Users), baseQuery: {} };
  }

  return null;
};
