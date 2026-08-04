import { ILotteryDocument } from '@/lottery/@types/lottery';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    { ownerType, ownerId }: ILotteryDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType,
      ownerId,
    });
  },

  async campaign(
    { campaignId }: ILotteryDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.LotteryCampaigns.findOne({ _id: campaignId }).lean();
  },
};
