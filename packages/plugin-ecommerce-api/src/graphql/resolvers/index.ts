import customScalars from '@erxes/api-utils/src/customScalars';

import {
  productreview as productreviewMutations,
  lastViewedItem as lastViewedItemMutations,
  wishlist as wishlistMutations
} from './mutations';
import {
  productreview as productreviewQueries,
  lastViewedItem as lastViewedItemQueries,
  wishlist as wishlistQueries
} from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...productreviewMutations,
    ...wishlistMutations,
    ...lastViewedItemMutations
  },
  Query: {
    ...productreviewQueries,
    ...wishlistQueries,
    ...lastViewedItemQueries
  }
});

export default resolvers;
