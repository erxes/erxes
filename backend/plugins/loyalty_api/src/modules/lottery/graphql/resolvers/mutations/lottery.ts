import { ILottery } from '@/lottery/@types/lottery';
import { IContext } from '~/connectionResolvers';

export const lotteryMutations = {
  createLottery: async (
    _parent: undefined,
    doc: ILottery,
    { models, user }: IContext,
  ) => {
    return models.Lottery.createLottery(doc, user);
  },

  updateLottery: async (
    _parent: undefined,
    { _id, ...doc }: ILottery & { _id: string },
    { models, user }: IContext,
  ) => {
    return models.Lottery.updateLottery(_id, { ...doc }, user);
  },

  removeLottery: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.Lottery.removeLottery(_id);
  },

  buyLottery: async (
    _parent: undefined,
    params: {
      campaignId: string;
      ownerType: string;
      ownerId: string;
      count?: number;
    },
    { models, user }: IContext,
  ) => {
    return models.Lottery.buyLottery(params, user);
  },

  doLottery: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string },
    { models, user }: IContext,
  ) => {
    return models.Lottery.doLottery(params, user);
  },
  doLotteryMultiple: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string; multiple: number },
    { models, user }: IContext,
  ) => {
    return models.Lottery.multipleDoLottery(params, user);
  },
  getNextChar: async (
    _parent: undefined,
    params: { campaignId: string; awardId: string; prevChars: string },
    { models, user }: IContext,
  ) => {
    return models.Lottery.getNextChar(params, user);
  },
};
