import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './mutations';
import Query from './queries';

import DataLoaders from '../../dataLoaders/resolvers';

const resolvers: any = async serviceDiscovery => ({
  ...customScalars,

  ...DataLoaders,

  Mutation,
  Query
});

export default resolvers;
