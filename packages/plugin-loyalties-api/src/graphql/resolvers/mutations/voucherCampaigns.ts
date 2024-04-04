import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IVoucherCampaign } from '../../../models/definitions/voucherCampaigns';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES
} from '../../../logUtils';
const vouchersMutations = {
  async voucherCampaignsAdd(
    _root,
    doc: IVoucherCampaign,
    { models, user, subdomain }: IContext
  ) {
    const create = await models.VoucherCampaigns.createVoucherCampaign(doc);
    await putCreateLog(
      models,
      subdomain,
      { type: MODULE_NAMES.VOUCHER, newData: create, object: create },
      user
    );

    return create;
  },

  async voucherCampaignsEdit(
    _root,
    { _id, ...doc }: IVoucherCampaign & { _id: string },
    { models, subdomain, user }: IContext
  ) {
    const voucherCampaign = await models.VoucherCampaigns.findOne({
      _id
    }).lean();

    const update = await models.VoucherCampaigns.updateVoucherCampaign(
      _id,
      doc
    );
    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.VOUCHER,
        object: voucherCampaign,
        newData: doc,
        updatedDocument: update
      },
      user
    );
    return update;
  },

  async voucherCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models, subdomain, user }: IContext
  ) {
    const voucherCampaign: IVoucherCampaign[] = await models.VoucherCampaigns.find(
      {
        _id: { $in: _ids }
      }
    ).lean();

    const removed = models.VoucherCampaigns.removeVoucherCampaigns(_ids);
    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.VOUCHER, object: voucherCampaign },
      user
    );
    return removed;
  }
};

checkPermission(vouchersMutations, 'voucherCampaignsAdd', 'manageLoyalties');
checkPermission(vouchersMutations, 'voucherCampaignsEdit', 'manageLoyalties');
checkPermission(vouchersMutations, 'voucherCampaignsRemove', 'manageLoyalties');

export default vouchersMutations;
