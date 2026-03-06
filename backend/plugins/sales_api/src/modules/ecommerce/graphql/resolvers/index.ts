import { apolloCustomScalars } from 'erxes-api-shared/utils';

import {
  address as addressMutations,
  lastViewedItem as lastViewedItemMutations,
  productReview as productreviewMutations,
  wishlist as wishlistMutations,
} from './mutations';
import {
  address as addressQueries,
  lastViewedItem as lastViewedItemQueries,
  productReviewQueries,
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
    ...productReviewQueries,
    ...wishlistQueries,
    ...lastViewedItemQueries,
    ...addressQueries,
  },
});

export default resolvers;