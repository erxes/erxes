import Mutation from './mutations';

import Query from './queries';

import Pos from './pos';
import customScalars from '@erxes/api-utils/src/customScalars';

const resolvers: any = async () => ({
  ...customScalars,

  Pos,
  Mutation,
  Query,
});

export default resolvers;
