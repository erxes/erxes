import donateCompaignQueries from './resolvers/queries/donateCompaigns';
import loyaltQueries from './resolvers/queries/loyalties';
import loyaltyConfigQueries from './resolvers/queries/configs';
import voucherCompaignQueries from './resolvers/queries/voucherCompaigns';
import lotteryCompaignQueries from './resolvers/queries/lotteryCompaigns';
import spinCompaignQueries from './resolvers/queries/spinCompaigns';

const loyaltyQueries = [
  ...donateCompaignQueries,
  ...loyaltQueries,
  ...loyaltyConfigQueries,
  ...voucherCompaignQueries,
  ...lotteryCompaignQueries,
  ...spinCompaignQueries,
]

export default loyaltyQueries;
