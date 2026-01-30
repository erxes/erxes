import { IContext } from '~/connectionResolvers';
import { IAssignmentCampaign } from '@/assignment/@types/assignmentCampaign';

export const assignmentCampaignMutations = {
  createAssignmentCampaign: async (
    _parent: undefined,
    doc: IAssignmentCampaign,
    { models, user }: IContext,
  ) => {
    return models.AssignmentCampaign.createAssignmentCampaign(doc, user);
  },

  updateAssignmentCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IAssignmentCampaign,
    { models, user }: IContext,
  ) => {
    return models.AssignmentCampaign.updateAssignmentCampaign(_id, doc, user);
  },

  removeAssignmentCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.AssignmentCampaign.removeAssignmentCampaigns([_id]);
  },
};
