import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { taskMembershipCollections } from './collections';

export const applyTaskSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(taskMembershipCollections(models), data);
