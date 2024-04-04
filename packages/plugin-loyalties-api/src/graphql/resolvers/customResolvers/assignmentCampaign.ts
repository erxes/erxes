import { IContext } from '../../../connectionResolver';
import { IAssignmentCampaignDocument } from '../../../models/definitions/assignmentCampaigns';

export default {
  async assignmentsCount(
    assignmentCampaign: IAssignmentCampaignDocument,
    _args,
    { models }: IContext
  ) {
    return models.Assignments.find({
      campaignId: assignmentCampaign._id
    }).countDocuments();
  }
};
