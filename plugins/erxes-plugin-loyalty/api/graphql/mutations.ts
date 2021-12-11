import donateCompaignMutations from './resolvers/mutations/donateCompaigns';
import loyaltyConfigsMutations from './resolvers/mutations/configs';
import voucherCompaignMutations from './resolvers/mutations/voucherCompaigns';
import lotteryCompaignMutations from './resolvers/mutations/lotteryCompaigns';
import spinCompaignMutations from './resolvers/mutations/spinCompaigns';

const loyaltyMutations = [
  ...donateCompaignMutations,
  ...loyaltyConfigsMutations,
  ...voucherCompaignMutations,
  ...lotteryCompaignMutations,
  ...spinCompaignMutations,
];

export default loyaltyMutations;