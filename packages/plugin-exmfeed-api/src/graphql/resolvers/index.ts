import customScalars from '@erxes/api-utils/src/customScalars';

import ExmFeed from './exmFeed';
import ExmThank from './exmThank';

import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,

  ExmFeed,
  ExmThank,

  Mutation,
  Query
});

export default resolvers;
