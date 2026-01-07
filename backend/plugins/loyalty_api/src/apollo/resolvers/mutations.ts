import { pricingMutations } from '@/pricing/graphql/resolvers/mutations/pricing';
import { scoreMutations } from '~/modules/score/graphql/resolvers/mutations/score';

export const mutations = {
  ...pricingMutations,
  ...scoreMutations,
};
