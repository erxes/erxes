import { ebarimtQueries } from '@/ebarimt/graphql/resolvers/queries';
import { erkhetQueries } from '@/erkhet/graphql/resolvers/queries';

export const queries = {
  ...ebarimtQueries,
  ...erkhetQueries,
};
