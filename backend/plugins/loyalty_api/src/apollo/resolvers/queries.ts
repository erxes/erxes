import { pricingQueries } from '@/pricing/graphql/resolvers/queries/pricing';
import { scoreQueries } from '~/modules/score/graphql/resolvers/queries/score';

export const queries = {
  ...pricingQueries,
  ...scoreQueries,
};
