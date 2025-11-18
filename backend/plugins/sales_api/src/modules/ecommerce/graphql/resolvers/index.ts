import { apolloCustomScalars } from 'erxes-api-shared/utils';

import {
  address as addressMutations,
  lastViewedItem as lastViewedItemMutations,
  productreview as productreviewMutations,
  wishlist as wishlistMutations,
} from './mutations';
import {
  address as addressQueries,
  lastViewedItem as lastViewedItemQueries,
  productreview as productreviewQueries,
  wishlist as wishlistQueries,
} from './queries';

const resolvers: any = async (serviceDiscovery) => ({
  ...apolloCustomScalars,
  Mutation: {
    ...productreviewMutations,
    ...wishlistMutations,
    ...lastViewedItemMutations,
    ...addressMutations,
  },
  Query: {
    ...productreviewQueries,
    ...wishlistQueries,
    ...lastViewedItemQueries,
    ...addressQueries,
  },
});

export default resolvers;