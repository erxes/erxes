import Mutation from './mutations';
import Query from './queries';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = {
  ...customScalars,
  Mutation,
  Query
};

export default resolvers;
