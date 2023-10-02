import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IAssignmentCampaign } from '../../../models/definitions/assignmentCampaigns';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
const assignmentsMutations = {
  async assignmentCampaignsAdd(
    _root,
    doc: IAssignmentCampaign,
    { models, subdomain, user }: IContext
  ) {
    const create = await models.AssignmentCampaigns.createAssignmentCampaign(
      doc
    );
    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ASSINGNMENT, newData: create, object: create },
      user
    );
    return;
  },

  async assignmentCampaignsEdit(
    _root,
    { _id, ...doc }: IAssignmentCampaign & { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const assignmentCampaign = await models.AssignmentCampaigns.findOne({
      _id
    });

    const update = await models.AssignmentCampaigns.updateAssignmentCampaign(
      _id,
      doc
    );
    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ASSINGNMENT,
        object: assignmentCampaign,
        newData: doc,
        updatedDocument: update
      },
      user
    );
    return update;
  },

  async assignmentCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, subdomain, user }: IContext
  ) {
    const assignmentCampaign: IAssignmentCampaign[] = await models.AssignmentCampaigns.find(
      {
        _id: { $in: _ids }
      }
    ).lean();

    const removed = models.AssignmentCampaigns.removeAssignmentCampaigns(_ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ASSINGNMENT, object: assignmentCampaign },
      user
    );
    return removed;
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
