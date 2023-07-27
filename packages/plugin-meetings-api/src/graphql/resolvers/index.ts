import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

const resolvers: any = async () => ({
  ...customScalars,
  Mutation,
  Query
});

export default resolvers;
