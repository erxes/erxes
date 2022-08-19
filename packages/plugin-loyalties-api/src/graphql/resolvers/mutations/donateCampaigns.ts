import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IDonateCampaign } from '../../../models/definitions/donateCampaigns';

const donatesMutations = {
  async donateCampaignsAdd(_root, doc: IDonateCampaign, { models }: IContext) {
    return models.DonateCampaigns.createDonateCampaign(doc);
  },

  async donateCampaignsEdit(
    _root,
    { _id, ...doc }: IDonateCampaign & { _id: string },
    { models }: IContext
  ) {
    return models.DonateCampaigns.updateDonateCampaign(_id, doc);
  },

  async donateCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.DonateCampaigns.removeDonateCampaigns(_ids);
  }
};

checkPermission(donatesMutations, 'donateCampaignsAdd', 'manageLoyalties');
checkPermission(donatesMutations, 'donateCampaignsEdit', 'manageLoyalties');
checkPermission(donatesMutations, 'donateCampaignsRemove', 'manageLoyalties');

export default donatesMutations;
