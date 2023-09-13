import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IDonateCampaign } from '../../../models/definitions/donateCampaigns';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';

const donatesMutations = {
  async donateCampaignsAdd(
    _root,
    doc: IDonateCampaign,
    { models, subdomain, user }: IContext
  ) {
    const create = await models.DonateCampaigns.createDonateCampaign(
      doc,
      user._id
    );

    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.DONATE, newData: create, object: create },
      user
    );

    return create;
  },

  async donateCampaignsEdit(
    _root,
    { _id, ...doc }: IDonateCampaign & { _id: string },
    { models, subdomain, user }: IContext
  ) {
    // const donaneCampaign = await models.DonateCampaigns.getDonateCampaign(_id);
    const donateCampaign = await models.DonateCampaigns.findOne({ _id });

    const update = await models.DonateCampaigns.updateDonateCampaign(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.DONATE,
        object: donateCampaign,
        newData: doc,
        updatedDocument: update
      },
      user
    );
    return update;
  },

  async donateCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, subdomain, user }: IContext
  ) {
    const donateCampaign: IDonateCampaign[] = await models.DonateCampaigns.find(
      {
        _id: { $in: _ids }
      }
    ).lean();

    const removed = models.DonateCampaigns.removeDonateCampaigns(_ids);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.DONATE, object: donateCampaign },
      user
    );

    return removed;
  }
};

checkPermission(donatesMutations, 'donateCampaignsAdd', 'manageLoyalties');
checkPermission(donatesMutations, 'donateCampaignsEdit', 'manageLoyalties');
checkPermission(donatesMutations, 'donateCampaignsRemove', 'manageLoyalties');

export default donatesMutations;
