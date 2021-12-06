import { AssignmentCompaign, assignmentCompaignSchema } from './models/AssignmentCompaigns';
import { DonateCompaign, donateCompaignSchema } from './models/DonateCompaigns';
import { LotteryCompaign, lotteryCompaignSchema } from './models/LotteryCompaigns';
import { Loyalty, loyaltySchema } from './models/Loyalties';
import { LoyaltyConfig, loyaltyConfigSchema } from './models/LoyaltyConfig';
import { SpinCompaign, spinCompaignSchema } from './models/SpinCompaigns';
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
];
