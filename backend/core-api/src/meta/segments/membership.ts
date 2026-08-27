import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipCollection,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { segmentSource } from './collections';

/**
 * Writes settled membership onto core's own records.
 *
 * Core answers only for the content types it owns; the decision itself was
 * made elsewhere, by whoever ran the segment.
 */

const CORE_MEMBERSHIP_TYPES = [
  'core:contacts.customers',
  'core:contacts.leads',
  'core:contacts.companies',
  'core:organization.users',
];

export const applyCoreSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> => {
  const collections: Record<string, SegmentMembershipCollection> = {};

  for (const contentType of CORE_MEMBERSHIP_TYPES) {
    const source = segmentSource(models, contentType);

    if (source) {
      collections[contentType] = source.collection;
    }
  }

  return applySegmentMembership(collections, data);
};
