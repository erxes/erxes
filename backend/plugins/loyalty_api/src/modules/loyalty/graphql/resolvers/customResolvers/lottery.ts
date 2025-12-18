import { IContext } from '~/connectionResolvers';
import { ILotteryDocument } from '~/modules/loyalty/@types/lotteries';
import { getOwner } from '~/modules/loyalty/db/models/utils';

export default {
  async owner(lottery: ILotteryDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, lottery.ownerType, lottery.ownerId);
  },
  async campaign(lottery: ILotteryDocument, _args, { models }: IContext) {
    return models.LotteryCampaigns.findOne({ _id: lottery.campaignId }).lean();
  },
};
