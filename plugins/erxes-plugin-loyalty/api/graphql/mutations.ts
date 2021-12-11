import donateCompaignMutations from './resolvers/mutations/donateCompaigns';
import loyaltyConfigsMutations from './resolvers/mutations/configs';
import voucherCompaignMutations from './resolvers/mutations/voucherCompaigns';

const loyaltyMutations = [
  ...donateCompaignMutations,
  ...loyaltyConfigsMutations,
  ...voucherCompaignMutations,
];

export default loyaltyMutations;