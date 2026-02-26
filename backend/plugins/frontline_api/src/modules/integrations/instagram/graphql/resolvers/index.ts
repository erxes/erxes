import { apolloCustomScalars } from 'erxes-api-shared/utils';

import { instagramMutations } from './mutations';
import { instagramQueries } from './queries';

const resolvers: any = async () => ({
  ...apolloCustomScalars,

  Mutation: {
    ...instagramMutations,
  },
  Query: {
    ...instagramQueries,
  },
});

export default resolvers;
