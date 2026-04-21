import { ebarimtQueries } from '@/ebarimt/graphql/resolvers/queries';
import { erkhetQueries } from '@/erkhet/graphql/resolvers/queries';
import { mnConfigQueries } from '@/configs/graphql/resolvers/queries';
import { msdynamicQueries } from '@/msdynamic/graphql/resolvers/queries/dynamic';
import { exchangeRateQueries } from '@/exchangeRates/graphql/resolvers/queries';

export const queries = {
  ...mnConfigQueries,
  ...ebarimtQueries,
  ...erkhetQueries,
  ...msdynamicQueries,
  ...exchangeRateQueries,
};
