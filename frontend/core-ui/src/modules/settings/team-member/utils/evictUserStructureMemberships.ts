import type { ApolloCache } from '@apollo/client';

export const evictUserStructureMemberships = <T>(
  cache: ApolloCache<T>,
  userId: string,
) => {
  cache.evict({
    id: cache.identify({ __typename: 'User', _id: userId }),
    fieldName: 'structureMemberships',
  });
  cache.gc();
};
