import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ISpinCampaign } from '../../../models/definitions/spinCampaigns';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
const spinsMutations = {
  async spinCampaignsAdd(
    _root,
    doc: ISpinCampaign,
    { models, subdomain, user }: IContext
  ) {
    const create = await models.SpinCampaigns.createSpinCampaign(doc);

    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.SPIN, newData: create, object: create },
      user
    );
    return create;
  },

  async spinCampaignsEdit(
    _root,
    { _id, ...doc }: ISpinCampaign & { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const spinCampaign = await models.SpinCampaigns.findOne({ _id }).lean();
    const update = await models.SpinCampaigns.updateSpinCampaign(_id, doc);
    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.SPIN,
        object: spinCampaign,
        newData: doc,
        updatedDocument: update
      },
      user
    );
    return update;
  },

  async spinCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, subdomain, user }: IContext
  ) {
    const spinCampaigns: ISpinCampaign[] = await models.SpinCampaigns.find({
      _id: { $in: _ids }
    }).lean();
    const removed = models.SpinCampaigns.removeSpinCampaigns(_ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.SPIN, object: spinCampaigns },
      user
    );
    return removed;
  }
};

checkPermission(spinsMutations, 'spinCampaignsAdd', 'manageLoyalties');
checkPermission(spinsMutations, 'spinCampaignsEdit', 'manageLoyalties');
checkPermission(spinsMutations, 'spinCampaignsRemove', 'manageLoyalties');

export default spinsMutations;
