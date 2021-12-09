import loyaltyConfigsMutations from "./resolvers/mutations/configs";
import voucherCompaignMutations from "./resolvers/mutations/voucherCompaigns";

const loyaltyMutations = [
  ...loyaltyConfigsMutations,
  ...voucherCompaignMutations
];

export default loyaltyMutations;