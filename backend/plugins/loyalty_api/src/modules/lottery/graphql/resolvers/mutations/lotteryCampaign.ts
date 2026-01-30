import { ILotteryCampaign } from '@/lottery/@types/lotteryCampaign';
import { IContext } from '~/connectionResolvers';

export const lotteryCampaignMutations = {
  createLotteryCampaign: async (
    _parent: undefined,
    doc: ILotteryCampaign,
    { models, user }: IContext,
  ) => {
    return models.LotteryCampaign.createLotteryCampaign(doc, user);
  },

  updateLotteryCampaign: async (
    _parent: undefined,
    { _id, ...doc }: ILotteryCampaign & { _id: string },
    { models, user }: IContext,
  ) => {
    return models.LotteryCampaign.updateLotteryCampaign(_id, doc, user);
  },

  removeLotteryCampaign: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.LotteryCampaign.removeLotteryCampaign(_id);
  },

  doLottery: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string },
    { models, user }: IContext,
  ) => {
    return models.LotteryCampaign.doLottery(params, user);
  },

  doLotteryMultiple: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string; multiple: number },
    { models, user }: IContext,
  ) => {
    return models.LotteryCampaign.multipleDoLottery(params, user);
  },

  getNextChar: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string; prevChars: string },
    { models, user }: IContext,
  ) => {
    return models.LotteryCampaign.getNextChar(params, user);
  },
};
