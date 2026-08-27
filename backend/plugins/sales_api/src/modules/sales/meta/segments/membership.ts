import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipCollection,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

/**
 * Writes settled membership onto this plugin's own deals.
 *
 * The decision is made by whoever ran the segment; sales only owns the write,
 * so no other service ever touches the deal collection.
 */
export const applyDealSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(
    {
      'sales:sales.deals':
        models.Deals as unknown as SegmentMembershipCollection,
    },
    data,
  );
