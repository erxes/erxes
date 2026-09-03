import {
  applySegmentMembership,
  SegmentApplyMembershipResult,
  SegmentMembershipUpdate,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { ticketMembershipCollections } from './collections';

export const applyTicketSegmentMembership = async (
  models: IModels,
  data: { contentType: string; updates: SegmentMembershipUpdate[] },
): Promise<SegmentApplyMembershipResult> =>
  applySegmentMembership(ticketMembershipCollections(models), data);
