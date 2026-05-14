import { IVoucherCampaign } from '@/voucher/@types/voucherCampaign';
import { IContext } from '~/connectionResolvers';

export const voucherCampaignMutations = {
  async voucherCampaignsAdd(
    _root: undefined,
    doc: IVoucherCampaign,
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.createVoucherCampaign(doc);
  },

  async voucherCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IVoucherCampaign,
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.updateVoucherCampaign(_id, doc);
  },

  async voucherCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.VoucherCampaigns.removeVoucherCampaigns(_ids);
  },
};

export default voucherCampaignMutations;
