import customScalars from '@erxes/api-utils/src/customScalars';

import { productreview as productreviewMutations } from './mutations';
import { productreview as productreviewQueries } from './queries';
import { wishlist as wishlistMutations } from './mutations';
import { wishlist as wishlistQueries } from './queries';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Mutation: {
    ...productreviewMutations,
    ...wishlistMutations
  },
  Query: {
    ...productreviewQueries,
    ...wishlistQueries
  }
});

export default resolvers;
