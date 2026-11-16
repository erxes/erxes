import type { ApolloCache } from '@apollo/client';

export const evictContactDealLists = (cache: ApolloCache<unknown>) =>
  cache.modify({
    id: 'ROOT_QUERY',
    fields: {
      deals: (existing, { DELETE, storeFieldName }) =>
        /"(customerId|companyId)":/.test(storeFieldName) ? DELETE : existing,
    },
  });
