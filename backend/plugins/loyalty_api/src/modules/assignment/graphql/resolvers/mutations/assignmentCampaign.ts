import { IAssignmentCampaign } from '@/assignment/@types/assignmentCampaign';
import { IContext } from '~/connectionResolvers';

export const assignmentCampaignMutations = {
  async assignmentCampaignsAdd(
    _root: undefined,
    doc: IAssignmentCampaign,
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.createAssignmentCampaign(doc);
  },

  async assignmentCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: IAssignmentCampaign & { _id: string },
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.updateAssignmentCampaign(_id, doc);
  },

  async assignmentCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.AssignmentCampaigns.removeAssignmentCampaigns(_ids);
  },
};
