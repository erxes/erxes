import donateCompaignQueries from './resolvers/queries/donateCompaigns';
import loyaltQueries from './resolvers/queries/loyalties';
import loyaltyConfigQueries from './resolvers/queries/configs';
import voucherCompaignQueries from './resolvers/queries/voucherCompaigns';

const loyaltyQueries = [
  ...donateCompaignQueries,
  ...loyaltQueries,
  ...loyaltyConfigQueries,
  ...voucherCompaignQueries,
]

export default loyaltyQueries;
