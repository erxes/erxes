import { IContext } from '~/connectionResolvers';
import { IAssignmentDocument } from '~/modules/loyalty/@types/assignments';
import { getOwner } from '~/modules/loyalty/db/models/utils';

export default {
  async owner(assignment: IAssignmentDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, assignment.ownerType, assignment.ownerId);
  },
  async campaign(assignment: IAssignmentDocument, _args, { models }: IContext) {
    return models.AssignmentCampaigns.findOne({
      _id: assignment.campaignId,
    }).lean();
  },
};
