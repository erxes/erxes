import customScalars from '@erxes/api-utils/src/customScalars';

import { Meeting, Topic, PinnedUser } from './mutations';
import Query from './queries';

import customResolvers from './customResolvers';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,

  Mutation: {
    ...Meeting,
    ...Topic,
    ...PinnedUser
  },
  Query
});

export default resolvers;
