import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { salesMembershipCollections } from './collections';

export const applyDealSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(salesMembershipCollections(models), data);
