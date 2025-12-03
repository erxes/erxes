import { IContext } from '~/connectionResolvers';
import { IAssignmentCampaignDocument } from '~/modules/loyalty/@types/assignmentCampaigns';

export default {
  async assignmentsCount(
    assignmentCampaign: IAssignmentCampaignDocument,
    _args,
    { models }: IContext,
  ) {
    return models.Assignments.find({
      campaignId: assignmentCampaign._id,
    }).countDocuments();
  },
};
