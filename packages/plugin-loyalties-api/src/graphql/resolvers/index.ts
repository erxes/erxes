import customScalars from '@erxes/api-utils/src/customScalars';
import Donate from './customResolvers/donate';
import DonateCampaign from './customResolvers/donateCampaign';
import loyaltyConfigQueries from './queries/configs';
import Voucher from './customResolvers/voucher';
import VoucherCampaign from './customResolvers/voucherCampaign';
import Spin from './customResolvers/spin';
import SpinCampaign from './customResolvers/spinCampaign';
import Lottery from './customResolvers/lottery';
import LotteryCampaign from './customResolvers/lotteryCampaign';
import ScoreLog from './customResolvers/scoreLog';
import {
  Configs as LoyaltyConfigMutations,
  Donates as DonateMutations,
  DonateCampaigns as DonateCampaignMutations,
  Vouchers as VoucherMutations,
  VoucherCampaigns as VoucherCampaignMutations,
  Spins as SpinMutations,
  SpinCampaigns as SpinCampaignMutations,
  Lotteries as LotteryMutations,
  LotteryCampaigns as LotteryCampaignMutations,
  Loyalties as LoyaltyMutations,
  ScoreLogs as ScoreLogMutations
} from './mutations';
import {
  Donates as DonateQueries,
  DonateCampaigns as DonateCampaignQueries,
  Spins as SpinQueries,
  SpinCampaigns as SpinCampaignQueries,
  Lotteries as LotteryQueries,
  LotteryCampaigns as LotteryCampaignQueries,
  Vouchers as VoucherQueries,
  VoucherCampaigns as VoucherCampaignQueries,
  ScoreLogs as ScoreLogQueries,
  Loyalties as LoyaltyQueries
} from './queries';

const resolvers: any = async (serviceDiscovery) => (

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
