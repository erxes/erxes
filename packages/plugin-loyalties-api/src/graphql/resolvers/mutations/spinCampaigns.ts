import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { ISpinCampaign } from '../../../models/definitions/spinCampaigns';

const spinsMutations = {
  async spinCampaignsAdd(_root, doc: ISpinCampaign, { models }: IContext) {
    return models.SpinCampaigns.createSpinCampaign(doc);
  },

  async spinCampaignsEdit(
    _root,
    { _id, ...doc }: ISpinCampaign & { _id: string },
    { models }: IContext
  ) {
    return models.SpinCampaigns.updateSpinCampaign(_id, doc);
  },

  async spinCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.SpinCampaigns.removeSpinCampaigns(_ids);
  }
};

checkPermission(spinsMutations, 'spinCampaignsAdd', 'manageLoyalties');
checkPermission(spinsMutations, 'spinCampaignsEdit', 'manageLoyalties');
checkPermission(spinsMutations, 'spinCampaignsRemove', 'manageLoyalties');

export default spinsMutations;
