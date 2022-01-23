import donateCompaignQueries from './resolvers/queries/donateCompaigns';
import lotteryCompaignQueries from './resolvers/queries/lotteryCompaigns';
import loyaltQueries from './resolvers/queries/loyalties';
import loyaltyConfigQueries from './resolvers/queries/configs';
import spinCompaignQueries from './resolvers/queries/spinCompaigns';
import voucherCompaignQueries from './resolvers/queries/voucherCompaigns';
import voucherQueries from './resolvers/queries/vouchers';
import donateQueries from './resolvers/queries/donates';
import spinQueries from './resolvers/queries/spins';
import lotteryQueries from './resolvers/queries/lotteries';

const loyaltyQueries = [
  ...donateCompaignQueries,
  ...loyaltQueries,
  ...loyaltyConfigQueries,
  ...voucherCompaignQueries,
  ...lotteryCompaignQueries,
  ...spinCompaignQueries,
  ...voucherQueries,
  ...donateQueries,
  ...spinQueries,
  ...lotteryQueries,

]

export default loyaltyQueries;
