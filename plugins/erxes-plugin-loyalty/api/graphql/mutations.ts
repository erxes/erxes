import donateCompaignMutations from './resolvers/mutations/donateCompaigns';
import donates from './resolvers/mutations/donates';
import lotteries from './resolvers/mutations/lotteries';
import lotteryCompaignMutations from './resolvers/mutations/lotteryCompaigns';
import loyaltyConfigsMutations from './resolvers/mutations/configs';
import spinCompaignMutations from './resolvers/mutations/spinCompaigns';
import spins from './resolvers/mutations/spins';
import voucherCompaignMutations from './resolvers/mutations/voucherCompaigns';
import vouchers from './resolvers/mutations/vouchers';

const loyaltyMutations = [
  ...donateCompaignMutations,
  ...loyaltyConfigsMutations,
  ...voucherCompaignMutations,
  ...lotteryCompaignMutations,
  ...spinCompaignMutations,
  ...vouchers,
  ...donates,
  ...spins,
  ...lotteries,
];

export default loyaltyMutations;