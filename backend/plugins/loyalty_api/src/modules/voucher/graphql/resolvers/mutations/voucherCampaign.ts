import {
  IVoucherAutoIssue,
  IVoucherCampaign,
  TVoucherAutoIssueKind,
} from '@/voucher/@types/voucherCampaign';
import { IContext } from '~/connectionResolvers';

export const voucherCampaignMutations = {
  async voucherCampaignsAdd(
    _root: undefined,
    doc: IVoucherCampaign,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');
    return models.VoucherCampaigns.createVoucherCampaign(doc);
  },

  async voucherCampaignsEdit(
  _root: undefined,
  { _id, ...doc }: { _id: string } & IVoucherCampaign,
  { models, checkPermission }: IContext,
) {
  await checkPermission('loyaltyCampaignUpdate');
  await models.VoucherCampaigns.updateVoucherCampaign(_id, doc);
  return models.VoucherCampaigns.findOne({ _id });
},

  async voucherCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return models.VoucherCampaigns.removeVoucherCampaigns(_ids);
  },

  async voucherCampaignSetAutoIssue(
    _root: undefined,
    { _id, ...autoIssue }: { _id: string } & IVoucherAutoIssue,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return models.VoucherCampaigns.setVoucherAutoIssue(_id, autoIssue);
  },

  async voucherCampaignRemoveAutoIssue(
    _root: undefined,
    { _id, kind }: { _id: string; kind: TVoucherAutoIssueKind },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return models.VoucherCampaigns.removeVoucherAutoIssue(_id, kind);
  },
};

export default voucherCampaignMutations;