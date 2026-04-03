import { IAssignmentCampaignDocument } from '@/assignment/@types/assignmentCampaign';
import { IContext } from '~/connectionResolvers';

export default {
  assignmentsCount: async (
    { _id }: IAssignmentCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) => {
    return models.Assignments.countDocuments({
      campaignId: _id,
    });
  },
};
