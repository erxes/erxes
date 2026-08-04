import { IAssignmentDocument } from '@/assignment/@types/assignment';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';

export default {
  async __resolveReference(
    { _id }: IAssignmentDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.Assignments.findOne({ _id }).lean();
  },

  async owner(
    assignment: IAssignmentDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType: assignment.ownerType,
      ownerId: assignment.ownerId,
    });
  },

  async campaign(
    assignment: IAssignmentDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.findOne({
      _id: assignment.campaignId,
    }).lean();
  },
};
