import customScalars from '@erxes/api-utils/src/customScalars';

import { Meeting, Topic } from './mutations';
import Query from './queries';

import customResolvers from './customResolvers';

const resolvers: any = async () => ({
  ...customScalars,
  ...customResolvers,

  Mutation: {
    ...Meeting,
    ...Topic
  },
  Query
});

export default resolvers;
