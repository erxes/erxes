import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { posMembershipCollections } from './collections';

/**
 * Writes settled membership onto this module's own orders.
 *
 * The decision is made by whoever ran the segment; pos only owns the write.
 */
export const applyPosSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(posMembershipCollections(models), data);
