import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IAssignmentCampaign } from '../../../models/definitions/assignmentCampaigns';

const assignmentsMutations = {
  async assignmentCampaignsAdd(
    _root,
    doc: IAssignmentCampaign,
    { models }: IContext
  ) {
    return models.AssignmentCampaigns.createAssignmentCampaign(doc);
  },

  async assignmentCampaignsEdit(
    _root,
    { _id, ...doc }: IAssignmentCampaign & { _id: string },
    { models }: IContext
  ) {
    return models.AssignmentCampaigns.updateAssignmentCampaign(_id, doc);
  },

  async assignmentCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.AssignmentCampaigns.removeAssignmentCampaigns(_ids);
  }
};

checkPermission(
  assignmentsMutations,
  'assignmentCampaignsAdd',
  'manageLoyalties'
);
checkPermission(
  assignmentsMutations,
  'assignmentCampaignsEdit',
  'manageLoyalties'
);
checkPermission(
  assignmentsMutations,
  'assignmentCampaignsRemove',
  'manageLoyalties'
);

export default assignmentsMutations;
