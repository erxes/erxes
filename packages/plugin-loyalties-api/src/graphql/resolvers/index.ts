import customScalars from '@erxes/api-utils/src/customScalars';
import Donate from './customResolvers/donate';
import DonateCampaign from './customResolvers/donateCampaign';
import Lottery from './customResolvers/lottery';
import LotteryCampaign from './customResolvers/lotteryCampaign';
import ScoreLog from './customResolvers/scoreLog';
import Spin from './customResolvers/spin';
import SpinCampaign from './customResolvers/spinCampaign';
import Voucher from './customResolvers/voucher';
import VoucherCampaign from './customResolvers/voucherCampaign';
import {
  Configs as LoyaltyConfigMutations,
  DonateCampaigns as DonateCampaignMutations,
  Donates as DonateMutations,
  Lotteries as LotteryMutations,
  LotteryCampaigns as LotteryCampaignMutations,
  Loyalties as LoyaltyMutations,
  ScoreLogs as ScoreLogMutations,
  SpinCampaigns as SpinCampaignMutations,
  Spins as SpinMutations,
  VoucherCampaigns as VoucherCampaignMutations,
  Vouchers as VoucherMutations
} from './mutations';
import loyaltyConfigQueries from './queries/configs';

import {
  DonateCampaigns as DonateCampaignQueries,
  Donates as DonateQueries,
  Lotteries as LotteryQueries,
  LotteryCampaigns as LotteryCampaignQueries,
  Loyalties as LoyaltyQueries,
  ScoreLogs as ScoreLogQueries,
  SpinCampaigns as SpinCampaignQueries,
  Spins as SpinQueries,
  VoucherCampaigns as VoucherCampaignQueries,
  Vouchers as VoucherQueries
} from './queries';

const resolvers: any = async serviceDiscovery => (
  
  {
  ...customScalars,
  Donate,
  DonateCampaign,
  Voucher,
  VoucherCampaign,
  Spin,
  SpinCampaign,
  Lottery,
  LotteryCampaign,
  ScoreLog,
  Mutation: {
    ...LoyaltyConfigMutations,
    ...DonateMutations,
    ...DonateCampaignMutations,
    ...VoucherMutations,
    ...VoucherCampaignMutations,
    ...SpinMutations,
    ...SpinCampaignMutations,
    ...LotteryMutations,
    ...LotteryCampaignMutations,
    ...LoyaltyMutations,
    ...ScoreLogMutations
  },
  Query: {
    ...loyaltyConfigQueries,
    ...DonateQueries,
    ...DonateCampaignQueries,
    ...SpinQueries,
    ...SpinCampaignQueries,
    ...LotteryQueries,
    ...LotteryCampaignQueries,
    ...VoucherQueries,
    ...VoucherCampaignQueries,
    ...ScoreLogQueries,
    ...LoyaltyQueries
  }
});

export default resolvers;
