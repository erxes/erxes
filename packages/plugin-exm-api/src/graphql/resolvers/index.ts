import customScalars from '@erxes/api-utils/src/customScalars';

import Mutation from './Mutation';
import Query from './Query';

const resolvers: any = {
  ...customScalars,

  Mutation,
  Query
};

export default resolvers;
