import { ILotteryCampaign } from '@/lottery/@types/lotteryCampaign';
import { IContext } from '~/connectionResolvers';

export const lotteryCampaignMutations = {
  async lotteryCampaignsAdd(
    _root: undefined,
    doc: ILotteryCampaign,
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.createLotteryCampaign(doc);
  },

  async lotteryCampaignsEdit(
    _root: undefined,
    { _id, ...doc }: ILotteryCampaign & { _id: string },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.updateLotteryCampaign(_id, doc);
  },

  async lotteryCampaignsRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.removeLotteryCampaigns(_ids);
  },

  async doLottery(
    _root: undefined,
    params: { campaignId: string; awardId: string },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.doLottery(params);
  },

  async doLotteryMultiple(
    _root: undefined,
    params: { campaignId: string; awardId: string; multiple: number },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.multipleDoLottery(params);
  },

  async getNextChar(
    _root: undefined,
    params: { campaignId: string; awardId: string; prevChars: string },
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.getNextChar(params);
  },
};
