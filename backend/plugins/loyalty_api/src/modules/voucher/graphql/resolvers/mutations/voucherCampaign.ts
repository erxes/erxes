import { IContext } from '~/connectionResolvers';
import { IVoucherCampaign } from '@/voucher/@types/voucherCampaign';

export const voucherCampaignMutations = {
  async voucherCampaignAdd(
    _parent: undefined,
    doc: IVoucherCampaign,
    { models }: IContext,
  ) {
    return models.VoucherCampaign.createVoucherCampaign(doc);
  },

  async voucherCampaignEdit(
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IVoucherCampaign,
    { models }: IContext,
  ) {
    return models.VoucherCampaign.updateVoucherCampaign(_id, doc);
  },

  async voucherCampaignsRemove(
    _parent: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.VoucherCampaign.removeVoucherCampaigns(_ids);
  },
};

export default voucherCampaignMutations;
