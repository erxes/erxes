import { ILotteryCampaign } from '@/lottery/@types/lotteryCampaign';
import { IContext } from '~/connectionResolvers';

export const lotteryCampaignMutations = {
  async lotteryCampaignsAdd(
    _root: undefined,
    doc: ILotteryCampaign,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');
    return models.LotteryCampaigns.createLotteryCampaign(doc);
  },

  async lotteryCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: ILotteryCampaign & { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');
    return models.LotteryCampaigns.updateLotteryCampaign(_id, doc);
  },

  async lotteryCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignRemove');
    return models.LotteryCampaigns.removeLotteryCampaigns(_ids);
  },

  async doLottery(
    _root: undefined,
    params: { campaignId: string; awardId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('lotteryCampaignDo');
    return models.LotteryCampaigns.doLottery(params);
  },

  async doLotteryMultiple(
    _root: undefined,
    params: { campaignId: string; awardId: string; multiple: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('lotteryCampaignDo');
    return models.LotteryCampaigns.multipleDoLottery(params);
  },

  async getNextChar(
    _root: undefined,
    params: { campaignId: string; awardId: string; prevChars: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('lotteryCampaignDo');
    return models.LotteryCampaigns.getNextChar(params);
  },
};