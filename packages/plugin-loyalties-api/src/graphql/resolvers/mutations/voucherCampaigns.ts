import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IVoucherCampaign } from '../../../models/definitions/voucherCampaigns';

const vouchersMutations = {
  async voucherCampaignsAdd(
    _root,
    doc: IVoucherCampaign,
    { models }: IContext
  ) {
    return models.VoucherCampaigns.createVoucherCampaign(doc);
  },

  async voucherCampaignsEdit(
    _root,
    { _id, ...doc }: IVoucherCampaign & { _id: string },
    { models }: IContext
  ) {
    return models.VoucherCampaigns.updateVoucherCampaign(_id, doc);
  },

  async voucherCampaignsRemove(
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) {
    return models.VoucherCampaigns.removeVoucherCampaigns(_ids);
  }
};

checkPermission(vouchersMutations, 'voucherCampaignsAdd', 'manageLoyalties');
checkPermission(vouchersMutations, 'voucherCampaignsEdit', 'manageLoyalties');
checkPermission(vouchersMutations, 'voucherCampaignsRemove', 'manageLoyalties');

export default vouchersMutations;
