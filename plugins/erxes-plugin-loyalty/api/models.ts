import { AssignmentCompaign, assignmentCompaignSchema } from './models/AssignmentCompaigns';
import { Donate, donateSchema } from './models/Donates';
import { DonateCompaign, donateCompaignSchema } from './models/DonateCompaigns';
import { Lottery, lotterySchema } from './models/Lotteries';
import { LotteryCompaign, lotteryCompaignSchema } from './models/LotteryCompaigns';
import { Loyalty, loyaltySchema } from './models/Loyalties';
import { LoyaltyConfig, loyaltyConfigSchema } from './models/LoyaltyConfig';
import { Spin, spinSchema } from './models/Spins';
import { SpinCompaign, spinCompaignSchema } from './models/SpinCompaigns';
import { Voucher, voucherCompoundIndexes, voucherSchema } from './models/Vouchers';
import { VoucherCompaign, voucherCompaignSchema } from './models/VoucherCompaigns';


export default [
  {
    name: 'LoyaltyConfigs',
    schema: loyaltyConfigSchema,
    klass: LoyaltyConfig
  },
  {
    name: 'Loyalties',
    schema: loyaltySchema,
    klass: Loyalty
  },
  {
    name: 'AssignmentCompaigns',
    schema: assignmentCompaignSchema,
    klass: AssignmentCompaign
  },
  {
    name: 'DonateCompaigns',
    schema: donateCompaignSchema,
    klass: DonateCompaign
  },
  {
    name: 'LotteryCompaigns',
    schema: lotteryCompaignSchema,
    klass: LotteryCompaign
  },
  {
    name: 'SpinCompaigns',
    schema: spinCompaignSchema,
    klass: SpinCompaign
  },
  {
    name: 'VoucherCompaigns',
    schema: voucherCompaignSchema,
    klass: VoucherCompaign
  },

  {
    name: 'Vouchers',
    schema: voucherSchema,
    klass: Voucher,
    compoundIndexes: voucherCompoundIndexes
  },
  {
    name: 'Spins',
    schema: spinSchema,
    klass: Spin,
  },
  {
    name: 'Lotteries',
    schema: lotterySchema,
    klass: Lottery,
  },
  {
    name: 'Donates',
    schema: donateSchema,
    klass: Donate,
  },


];
