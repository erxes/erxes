import { ebarimtQueries } from '@/ebarimt/graphql/resolvers/queries';
import { erkhetQueries } from '@/erkhet/graphql/resolvers/queries/remainders';


export const queries = {
  ...ebarimtQueries,
  ...erkhetQueries
};
