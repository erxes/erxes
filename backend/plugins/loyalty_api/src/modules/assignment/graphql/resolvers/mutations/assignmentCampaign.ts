import { IAssignmentCampaign } from '@/assignment/@types/assignmentCampaign';
import { IContext } from '~/connectionResolvers';

export const assignmentCampaignMutations = {
  async assignmentCampaignsAdd(
    _root: undefined,
    doc: IAssignmentCampaign,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentCampaignCreate');
    return models.AssignmentCampaigns.createAssignmentCampaign(doc);
  },     

  async assignmentCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: IAssignmentCampaign & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentCampaignEdit');
    return models.AssignmentCampaigns.updateAssignmentCampaign(_id, doc);
  },

  async assignmentCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('assignmentCampaignRemove');
    return models.AssignmentCampaigns.removeAssignmentCampaigns(_ids);
  },
};