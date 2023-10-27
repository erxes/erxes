import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutaions';
import Query from './queries';
import Investment from './investment';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,
  Investment,
  Mutation,
  Query
});

export default resolvers;
