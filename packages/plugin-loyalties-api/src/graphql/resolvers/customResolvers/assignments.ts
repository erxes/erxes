import { IContext } from '../../../connectionResolver';
import { IAssignmentDocument } from '../../../models/definitions/assignments';
import { getOwner } from '../../../models/utils';

export default {
  async owner(assignment: IAssignmentDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, assignment.ownerType, assignment.ownerId);
  },
  async campaign(assignment: IAssignmentDocument, _args, { models }: IContext) {
    return models.AssignmentCampaigns.findOne({
      _id: assignment.campaignId
    }).lean();
  }
};
