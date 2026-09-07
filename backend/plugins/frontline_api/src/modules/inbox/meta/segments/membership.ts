import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { inboxMembershipCollections } from './collections';

/**
 * Writes settled membership onto this module's own conversations.
 *
 * The decision is made by whoever ran the segment; the inbox only owns the
 * write, so no other service ever touches the conversation collection.
 */
export const applyInboxSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(inboxMembershipCollections(models), data);
