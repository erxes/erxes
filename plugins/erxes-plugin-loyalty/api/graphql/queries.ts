import loyaltyConfigQueries from './resolvers/queries/configs'
import loyaltQueries from './resolvers/queries/loyalties'
import voucherCompaignQueries from './resolvers/queries/voucherCompaigns'

const loyaltyQueries = [
  ...loyaltyConfigQueries,
  ...loyaltQueries,
  ...voucherCompaignQueries
]

export default loyaltyQueries;
