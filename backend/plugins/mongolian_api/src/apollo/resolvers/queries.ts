import { ebarimtQueries } from '@/ebarimt/graphql/resolvers/queries';
import { erkhetQueries } from '@/erkhet/graphql/resolvers/queries';
import { mnConfigQueries } from '@/configs/graphql/resolvers/queries';
import { exchangeRateQueries } from '@/exchangeRates/graphql/resolvers/queries';

export const queries = {
  ...mnConfigQueries,
  ...ebarimtQueries,
  ...erkhetQueries,
  ...exchangeRateQueries,
};
