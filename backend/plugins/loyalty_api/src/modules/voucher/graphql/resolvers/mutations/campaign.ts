import { IContext } from '~/connectionResolvers';
import { IVoucherCampaign } from '~/modules/voucher/@types/campaign';

export const voucherMutations = {
  createVoucherCampaign: async (
    _parent: undefined,
    doc: IVoucherCampaign,
    { models, user }: IContext,
  ) => {
    return models.VoucherCampaign.createCampaign(doc, user);
  },

  updateVoucherCampaign: async (
    _parent: undefined,
    { _id, ...doc }: { _id: string } & IVoucherCampaign,
    { models, user }: IContext,
  ) => {
    return models.VoucherCampaign.updateCampaign(_id, doc, user);
  },

  removeVoucherCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.VoucherCampaign.removeCampaign(_id);
  },
};
