import { IContext } from '~/connectionResolvers';
import { IAssignmentCampaignDocument } from '@/assignment/@types/assigmentCampaign';

export const assignmentCampaignResolvers = {
  assignmentsCount: async (
    assignmentCampaign: IAssignmentCampaignDocument,
    _parent: undefined,
    { models }: IContext,
  ) => {
    return models.Assignment.countDocuments({
      campaignId: assignmentCampaign._id,
    });
  },
};
